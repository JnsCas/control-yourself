import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GmailService } from './gmail.service';
import { GmailClient } from './gmail.client';
import { GmailClientDev } from './gmail.client.dev';
import { GmailClientAbstract } from './gmail.client.abstract';

@Module({
  imports: [ConfigModule],
  providers: [
    GmailService,
    {
      provide: GmailClientAbstract,
      useClass: process.env.NODE_ENV === 'production' ? GmailClient : GmailClientDev,
    }
  ],
  exports: [GmailService]
})
export class GmailModule {} 