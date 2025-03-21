import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImapClientDev } from '../imap/imap.client.dev';
import { ImapClientAbstract } from '../imap/imap.client.abstract';
import { EmailParserService } from './email-parser.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ImapClient } from 'src/imap/imap.client';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailParserService,
    {
      provide: ImapClientAbstract,
      useClass: process.env.NODE_ENV === 'production' ? ImapClient : ImapClientDev,
    }
  ],
  exports: [EmailService],
})
export class EmailModule {} 