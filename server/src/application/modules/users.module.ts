import { UsersController } from '@jnscas/cy/src/application/controllers/users/users.controller'
import { EmailModule } from '@jnscas/cy/src/application/modules/email.module'
import { ExpensesModule } from '@jnscas/cy/src/application/modules/expenses.module'
import { GmailModule } from '@jnscas/cy/src/application/modules/gmail.module'
import { UserRepository } from '@jnscas/cy/src/domain/users/user.repository'
import { User, UserSchema } from '@jnscas/cy/src/domain/users/user.schema'
import { UsersService } from '@jnscas/cy/src/domain/users/users.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OAuth2Client } from 'google-auth-library'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GmailModule,
    ExpensesModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, OAuth2Client],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
