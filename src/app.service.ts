import { Injectable } from '@nestjs/common';
import { HealthCheck } from './interfaces/Healthcheck.interface';

@Injectable()
export class AppService {
  healthcheck(): HealthCheck {
    return {
      version: 1,
    };
  }
}
