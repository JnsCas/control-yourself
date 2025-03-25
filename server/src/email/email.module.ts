import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailParserService } from './email-parser.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [
    ConfigModule,
    GmailModule
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailParserService
  ],
  exports: [EmailService]
})
export class EmailModule {} 