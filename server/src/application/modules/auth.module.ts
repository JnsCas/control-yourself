import { Module } from '@nestjs/common'
import { OAuth2Controller } from '@jnscas/cy/src/application/controllers/auth/auth.controller'
import { UsersModule } from '@jnscas/cy/src/application/modules/users.module'
import { OAuth2Module } from '@jnscas/cy/src/application/modules/oauth2.module'
import { EncryptionModule } from '@jnscas/cy/src/infrastructure/encryption/encryption.module'

@Module({
  imports: [OAuth2Module, UsersModule, EncryptionModule],
  controllers: [OAuth2Controller],
})
export class AuthModule {}
