import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GmailModule } from '../gmail/gmail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [GmailModule, UsersModule],
  controllers: [AuthController],
})
export class AuthModule {} 