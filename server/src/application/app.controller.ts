import { Controller, Get } from '@nestjs/common';

@Controller('health-check')
export class AppController {
  
  @Get()
  getHealthCheck(): string {
    return 'OK';
  }
} 