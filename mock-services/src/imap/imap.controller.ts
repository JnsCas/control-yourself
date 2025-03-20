import { Controller, Post, Get, Body } from '@nestjs/common';
import { ImapService } from './imap.service';

@Controller('imap')
export class ImapController {
  constructor(private readonly imapService: ImapService) {}

  @Get('emails/unread')
  async getUnreadEmails() {
    // Simulate the fetchUnreadEmails method from ImapClient
    return {
      emails: [
        {
          from: 'visa@notifications.visa.com',
          to: 'test@example.com',
          subject: 'Transaction Alert',
          text: 'Amount: 50.00\nMerchant: Test Store\nDate: 2024-03-20',
          flags: ['\\Seen']
        }
      ]
    };
  }

  @Post('emails')
  async addEmail(@Body() email: {
    from: string;
    to: string;
    subject: string;
    text: string;
    flags?: string[];
  }) {
    await this.imapService.addTestEmail();
    return { message: 'Email added successfully' };
  }

  @Post('connect')
  async connect() {
    // Simulate connection
    return { status: 'connected' };
  }

  @Post('disconnect')
  async disconnect() {
    // Simulate disconnection
    return { status: 'disconnected' };
  }

  // We can add endpoints to control the mock server
  // For example: add test emails, reset state, etc.
} 