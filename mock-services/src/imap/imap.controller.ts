import { Controller, Post, Body } from '@nestjs/common';
import { ImapService } from './imap.service';

@Controller('imap')
export class ImapController {
  constructor(private readonly imapService: ImapService) {}

  // We can add endpoints to control the mock server
  // For example: add test emails, reset state, etc.
} 