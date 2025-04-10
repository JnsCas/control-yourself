import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@jnscas/cy/src/domain/users/schemas/user.schema';
import { UsersService } from '@jnscas/cy/src/domain/users/users.service';
import { UsersController } from '@jnscas/cy/src/application/users/users.controller';
import { GmailModule } from '@jnscas/cy/src/application/gmail/gmail.module';
import { ExpensesModule } from '@jnscas/cy/src/application/expenses/expenses.module';
import { EmailModule } from '@jnscas/cy/src/application/email/email.module';
import { UserRepository } from '@jnscas/cy/src/domain/users/repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GmailModule,
    ExpensesModule,
    EmailModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [MongooseModule, UsersService]
})
export class UsersModule {} 