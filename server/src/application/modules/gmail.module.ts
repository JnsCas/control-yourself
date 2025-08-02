import { GmailClient } from '@jnscas/cy/src/domain/gmail/gmail.client'
import { GmailService } from '@jnscas/cy/src/domain/gmail/gmail.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { OAuth2Module } from '@jnscas/cy/src/application/modules/oauth2.module'
import { EncryptionModule } from '@jnscas/cy/src/infrastructure/encryption/encryption.module'

@Module({
  imports: [ConfigModule, OAuth2Module, EncryptionModule],
  providers: [GmailService, GmailClient],
  exports: [GmailService],
})
export class GmailModule {}
