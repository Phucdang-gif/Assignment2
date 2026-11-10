import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'BrewLite API is running';
  }

  async checkHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        info: {
          database: { status: 'up' },
        },
      };
    } catch (error: any) {
      this.logger.error('Health check failed', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        info: {
          database: { status: 'down', error: error?.message },
        },
      };
    }
  }
}
