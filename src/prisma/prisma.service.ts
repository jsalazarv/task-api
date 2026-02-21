import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: PrismaClient;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    this.pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(this.pool);
    this.prismaClient = new PrismaClient({ adapter });
  }

  get client(): PrismaClient {
    return this.prismaClient;
  }

  async onModuleInit() {
    await this.prismaClient.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
    await this.pool.end();
    console.log('👋 Prisma disconnected from database');
  }

  get user() {
    return this.prismaClient.user;
  }

  get subscription() {
    return this.prismaClient.subscription;
  }

  get $transaction() {
    return this.prismaClient.$transaction.bind(this.prismaClient);
  }
}
