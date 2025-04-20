import { EmailModule } from '@jnscas/cy/src/application/email/email.module'
import { ExpensesModule } from '@jnscas/cy/src/application/expenses/expenses.module'
import { GmailModule } from '@jnscas/cy/src/application/gmail/gmail.module'
import { UsersController } from '@jnscas/cy/src/application/users/users.controller'
import { UserRepository } from '@jnscas/cy/src/domain/users/user.repository'
import { User, UserSchema } from '@jnscas/cy/src/domain/users/user.schema'
import { UsersService } from '@jnscas/cy/src/domain/users/users.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GmailModule,
    ExpensesModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
