import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'hometasks-api',
      version: '0.0.1',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
