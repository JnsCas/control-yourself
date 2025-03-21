import { Controller, Post, Get, Body } from '@nestjs/common';

@Controller('imap')
export class ImapController {
  @Get('emails/unread')
  async getUnreadEmails() {
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

  @Post('connect')
  async connect() {
    return { status: 'connected' };
  }

  @Post('disconnect')
  async disconnect() {
    return { status: 'disconnected' };
  }
} 