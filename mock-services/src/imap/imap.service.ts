import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class ImapService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly imapServer: ImapServer) {}

  async onModuleInit() {
    await this.imapServer.start();
    await this.setupTestMailbox();
  }

  async onModuleDestroy() {
    await this.imapServer.disconnect();
  }

  private async setupTestMailbox() {
    await this.imapServer.openMailbox('INBOX');
    await this.addTestEmail();
  }

  async addTestEmail() {
    await this.imapServer.appendEmail('INBOX', {
      from: 'visa@notifications.visa.com',
      to: 'test@example.com',
      subject: 'Transaction Alert',
      text: 'Amount: 50.00\nMerchant: Test Store\nDate: 2024-03-20',
      flags: ['\\Seen']
    });
  }
}