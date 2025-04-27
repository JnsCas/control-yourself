import { Module } from '@nestjs/common'
import { OAuth2Module } from '@jnscas/cy/src/application/oauth2/oauth2.module'
import { OAuth2Controller } from '@jnscas/cy/src/application/auth/auth.controller'
import { UsersModule } from '@jnscas/cy/src/application/users/users.module'
import { EncryptionModule } from '@jnscas/cy/src/infrastructure/encryption/encryption.module'

@Module({
  imports: [OAuth2Module, UsersModule, EncryptionModule],
  controllers: [OAuth2Controller],
})
export class AuthModule {}
