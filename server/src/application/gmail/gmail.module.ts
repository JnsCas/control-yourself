import { GmailClient } from '@jnscas/cy/src/domain/gmail/gmail.client';
import { GmailClientAbstract } from '@jnscas/cy/src/domain/gmail/gmail.client.abstract';
import { GmailClientDev } from '@jnscas/cy/src/domain/gmail/gmail.client.dev';
import { GmailService } from '@jnscas/cy/src/domain/gmail/gmail.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Module({
  imports: [ConfigModule],
  providers: [
    GmailService,
    {
      provide: GmailClientAbstract,
      useClass: process.env.NODE_ENV === 'production' ? GmailClient : GmailClientDev,
    },
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
  exports: [GmailService]
})
export class GmailModule {} 