import { Module } from '@nestjs/common';
import { ImapService } from './imap.service';
import { ImapController } from './imap.controller';
import { ImapServer } from './imap.server';

@Module({
  controllers: [ImapController],
  providers: [ImapServer, ImapService],
})
export class ImapModule {} 