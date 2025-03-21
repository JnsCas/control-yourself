import { Module } from '@nestjs/common';
import { ImapController } from './imap.controller';

@Module({
  controllers: [ImapController],
})
export class ImapModule {} 