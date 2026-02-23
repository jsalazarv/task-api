import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'hometasks-api',
      version: '0.0.1',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async checkDatabase() {
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      
      const userCount = await this.prisma.user.count();
      const subscriptionCount = await this.prisma.subscription.count();

      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          users: userCount,
          subscriptions: subscriptionCount,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: error.message,
        },
      };
    }
  }
}
