import { GmailClient } from '@jnscas/cy/src/domain/gmail/gmail.client'
import { GmailClientAbstract } from '@jnscas/cy/src/domain/gmail/gmail.client.abstract'
import { GmailClientDev } from '@jnscas/cy/src/domain/gmail/gmail.client.dev'
import { GmailService } from '@jnscas/cy/src/domain/gmail/gmail.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Module } from '@jnscas/cy/src/application/oauth2/oauth2.module'

@Module({
  imports: [ConfigModule, OAuth2Module],
  providers: [
    GmailService,
    {
      provide: GmailClientAbstract,
      useClass: process.env.NODE_ENV === 'production' ? GmailClient : GmailClientDev,
    },
  ],
  exports: [GmailService],
})
export class GmailModule {}
