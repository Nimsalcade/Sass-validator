import createParser from 'robots-parser';
import axios from 'axios';
import { RedisService } from './redis.service';
import { RobotsInfo } from '../types';

export class RobotsService {
  private redis: RedisService;
  private robotsCache = new Map<string, any>();

  constructor(redis: RedisService) {
    this.redis = redis;
  }

  async isAllowed(url: string, userAgent: string = '*'): Promise<RobotsInfo> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      let robots = this.robotsCache.get(robotsUrl);
      
      if (!robots) {
        const cachedRobots = await this.redis.getCacheEntry(robotsUrl);
        if (cachedRobots) {
          robots = createParser(robotsUrl, cachedRobots.content);
          this.robotsCache.set(robotsUrl, robots);
        } else {
          robots = await this.fetchAndCacheRobots(robotsUrl);
          if (robots) {
            this.robotsCache.set(robotsUrl, robots);
          }
        }
      }

      if (!robots) {
        return {
          allowed: true,
          userAgent,
        };
      }

      const allowed = robots.isAllowed(url, userAgent);
      const crawlDelay = robots.getCrawlDelay(userAgent);

      return {
        allowed,
        crawlDelay,
        userAgent,
      };
    } catch (error) {
      console.error('Robots check failed:', error);
      return {
        allowed: true,
        userAgent,
      };
    }
  }

  private async fetchAndCacheRobots(robotsUrl: string): Promise<any> {
    try {
      const response = await axios.get(robotsUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'ScrapingGuardrails/1.0 (+https://example.com/bot)',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const content = response.data;
        const robots = createParser(robotsUrl, content);
        
        await this.redis.setCacheEntry(robotsUrl, {
          content,
          status: response.status,
          headers: response.headers as Record<string, string>,
          ttl: 24 * 60 * 60 * 1000, // 24 hours
        });

        return robots;
      }
    } catch (error) {
      console.error('Failed to fetch robots.txt:', error);
    }

    return null;
  }

  clearCache(): void {
    this.robotsCache.clear();
  }
}