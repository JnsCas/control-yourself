import { GmailClient } from '@jnscas/cy/src/domain/gmail/gmail.client'
import { GmailService } from '@jnscas/cy/src/domain/gmail/gmail.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Module } from '@jnscas/cy/src/application/oauth2/oauth2.module'

@Module({
  imports: [ConfigModule, OAuth2Module],
  providers: [GmailService, GmailClient],
  exports: [GmailService],
})
export class GmailModule {}
