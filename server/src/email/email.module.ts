import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImapClient } from '../imap/imap.client';
import { EmailParserService } from './email-parser.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService, ImapClient, EmailParserService],
  exports: [EmailService],
})
export class EmailModule {} 