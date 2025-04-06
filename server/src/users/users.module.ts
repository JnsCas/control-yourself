import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GmailModule } from 'src/gmail/gmail.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { EmailModule } from 'src/email/email.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    GmailModule,
    ExpensesModule,
    EmailModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule, UsersService]
})
export class UsersModule {} 