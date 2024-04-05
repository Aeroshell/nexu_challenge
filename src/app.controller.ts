import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheck } from './interfaces/Healthcheck.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  healthcheck(): HealthCheck {
    return this.appService.healthcheck();
  }
}
