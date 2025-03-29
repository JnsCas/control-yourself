import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailParserService } from './email-parser.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { GmailModule } from '../gmail/gmail.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    GmailModule,
    ExpensesModule,
    UsersModule
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailParserService
  ],
  exports: [EmailService]
})
export class EmailModule {} 