import { PrismaClient } from '@prisma/client';
import { AuditLogEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AuditService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  async logRequest(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          id: uuidv4(),
          userId: entry.userId,
          projectId: entry.projectId,
          url: entry.url,
          method: entry.method,
          userAgent: entry.userAgent,
          status: entry.status,
          responseTime: entry.responseTime,
          cached: entry.cached,
          rateLimited: entry.rateLimited,
          robotsAllowed: entry.robotsAllowed,
          error: entry.error,
          metadata: entry.metadata,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  async getAuditLogs(filters?: {
    userId?: string;
    projectId?: string;
    url?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      const logs = await this.prisma.auditLog.findMany({
        where: {
          userId: filters?.userId,
          projectId: filters?.projectId,
          url: filters?.url,
          timestamp: {
            gte: filters?.startDate,
            lte: filters?.endDate,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: filters?.limit,
        skip: filters?.offset,
      });

      return logs.map(log => ({
        id: log.id,
        userId: log.userId || undefined,
        projectId: log.projectId || undefined,
        url: log.url,
        method: log.method,
        userAgent: log.userAgent,
        status: log.status,
        responseTime: log.responseTime,
        cached: log.cached,
        rateLimited: log.rateLimited,
        robotsAllowed: log.robotsAllowed,
        error: log.error || undefined,
        timestamp: log.timestamp,
        metadata: log.metadata as Record<string, any>,
      }));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  async getAuditStats(filters?: {
    userId?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalRequests: number;
    successfulRequests: number;
    cachedRequests: number;
    rateLimitedRequests: number;
    blockedByRobotsRequests: number;
    averageResponseTime: number;
  }> {
    try {
      const logs = await this.prisma.auditLog.findMany({
        where: {
          userId: filters?.userId,
          projectId: filters?.projectId,
          timestamp: {
            gte: filters?.startDate,
            lte: filters?.endDate,
          },
        },
        select: {
          status: true,
          responseTime: true,
          cached: true,
          rateLimited: true,
          robotsAllowed: true,
        },
      });

      const totalRequests = logs.length;
      const successfulRequests = logs.filter(log => log.status >= 200 && log.status < 400).length;
      const cachedRequests = logs.filter(log => log.cached).length;
      const rateLimitedRequests = logs.filter(log => log.rateLimited).length;
      const blockedByRobotsRequests = logs.filter(log => !log.robotsAllowed).length;
      const averageResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;

      return {
        totalRequests,
        successfulRequests,
        cachedRequests,
        rateLimitedRequests,
        blockedByRobotsRequests,
        averageResponseTime: Math.round(averageResponseTime),
      };
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
      return {
        totalRequests: 0,
        successfulRequests: 0,
        cachedRequests: 0,
        rateLimitedRequests: 0,
        blockedByRobotsRequests: 0,
        averageResponseTime: 0,
      };
    }
  }

  async cleanupOldLogs(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days retention

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      console.log(`Cleaned up ${result.count} old audit log entries`);
    } catch (error) {
      console.error('Failed to cleanup old audit logs:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}