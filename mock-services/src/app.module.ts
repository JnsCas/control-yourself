import { Module } from '@nestjs/common';
import { ImapModule } from './imap/imap.module';

@Module({
  imports: [ImapModule],
})
export class AppModule {} 