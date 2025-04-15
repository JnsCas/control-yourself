import { Controller, Get } from '@nestjs/common'

@Controller('health-check')
export class HealthCheckController {
  @Get()
  getHealthCheck(): string {
    return 'OK'
  }
}
