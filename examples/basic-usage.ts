import { ScrapingService } from '../src/services/scraping.service';
import { ScrapeRequest } from '../src/types';

async function basicExample() {
  const scrapingService = new ScrapingService();

  console.log('🕷️  Starting scraping example...');

  // Example 1: Basic scraping
  console.log('\n📄 Example 1: Basic scraping');
  const request1: ScrapeRequest = {
    url: 'https://example.com',
    user: 'demo-user',
    project: 'demo-project',
  };

  try {
    const result1 = await scrapingService.scrape(request1);
    console.log('Result 1:', {
      success: result1.success,
      status: result1.status,
      contentLength: result1.content?.length || 0,
      cached: result1.cached,
      rateLimited: result1.rateLimited,
      robotsAllowed: result1.robotsAllowed,
      error: result1.error,
    });
  } catch (error) {
    console.error('Error in example 1:', error);
  }

  // Example 2: Same URL again (should use cache)
  console.log('\n📄 Example 2: Same URL (should use cache)');
  try {
    const result2 = await scrapingService.scrape(request1);
    console.log('Result 2:', {
      success: result2.success,
      status: result2.status,
      contentLength: result2.content?.length || 0,
      cached: result2.cached,
      rateLimited: result2.rateLimited,
      robotsAllowed: result2.robotsAllowed,
      error: result2.error,
    });
  } catch (error) {
    console.error('Error in example 2:', error);
  }

  // Example 3: Custom user agent
  console.log('\n📄 Example 3: Custom user agent');
  const request3: ScrapeRequest = {
    url: 'https://httpbin.org/user-agent',
    userAgent: 'CustomBot/1.0 (+https://mybot.com)',
    user: 'demo-user',
    project: 'demo-project',
  };

  try {
    const result3 = await scrapingService.scrape(request3);
    console.log('Result 3:', {
      success: result3.success,
      status: result3.status,
      cached: result3.cached,
      rateLimited: result3.rateLimited,
      robotsAllowed: result3.robotsAllowed,
      error: result3.error,
    });
    
    if (result3.content) {
      console.log('Content preview:', result3.content.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error in example 3:', error);
  }

  // Example 4: URL with PII (should be filtered)
  console.log('\n📄 Example 4: URL with PII (should be filtered)');
  const request4: ScrapeRequest = {
    url: 'https://httpbin.org/html',
    user: 'demo-user',
    project: 'demo-project',
  };

  try {
    const result4 = await scrapingService.scrape(request4);
    console.log('Result 4:', {
      success: result4.success,
      status: result4.status,
      cached: result4.cached,
      rateLimited: result4.rateLimited,
      robotsAllowed: result4.robotsAllowed,
      error: result4.error,
    });
    
    if (result4.content) {
      console.log('Content preview:', result4.content.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error in example 4:', error);
  }

  // Cleanup
  await scrapingService.disconnect();
  console.log('\n✅ Example completed!');
}

// Run the example
if (require.main === module) {
  basicExample().catch(console.error);
}

export { basicExample };