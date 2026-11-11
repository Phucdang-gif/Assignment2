import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to BrewLite API';
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'BrewLite API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
