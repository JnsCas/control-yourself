import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TokenEncryptionService } from '@jnscas/cy/src/infrastructure/encryption/token-encryption.service'

@Module({
  imports: [ConfigModule],
  providers: [TokenEncryptionService],
  exports: [TokenEncryptionService],
})
export class EncryptionModule {}
