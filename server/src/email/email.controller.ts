import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('process')
  async processEmails() {
    return await this.emailService.processNewEmails();
  }
} 