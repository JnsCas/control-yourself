import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GmailService } from './gmail.service';
import { GmailClient } from './gmail.client';
import { GmailClientDev } from './gmail.client.dev';
import { GmailClientAbstract } from './gmail.client.abstract';
import { GmailCronService } from './cron.service';
import { UsersModule } from '../users/users.module';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [
    GmailService,
    {
      provide: GmailClientAbstract,
      useClass: process.env.NODE_ENV === 'production' ? GmailClient : GmailClientDev,
    },
    GmailCronService,
    {
      provide: OAuth2Client,
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client(
          configService.get('GOOGLE_CLIENT_ID'),
          configService.get('GOOGLE_CLIENT_SECRET'),
          configService.get('GOOGLE_REDIRECT_URI')
        );
      },
      inject: [ConfigService],
    }
  ],
  exports: [GmailService, OAuth2Client]
})
export class GmailModule {} 