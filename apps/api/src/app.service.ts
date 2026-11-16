import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  getHello(): string {
    return 'Welcome to BrewLite API';
  }

  async getHealth() {
    let dbStatus = 'up';
    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch {
        dbStatus = 'down';
      }
    }

    return {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      service: 'BrewLite API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      info: {
        database: { status: dbStatus },
      },
    };
  }
}
