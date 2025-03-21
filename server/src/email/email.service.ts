import { Injectable, Logger } from '@nestjs/common';
import { ImapClient } from './imap/imap.client';
import { EmailParserService } from './email-parser.service';
import { ImapClientAbstract } from './imap/imap.client.abstract';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly imapClient: ImapClientAbstract,
    private readonly emailParser: EmailParserService,
  ) {}

  async processNewEmails() {
    try {
      await this.imapClient.connect();
      const emails = await this.imapClient.fetchUnreadEmails();
      
      const transactions = [];
      for (const email of emails) {
        try {
          const transaction = this.emailParser.parseEmailContent(email);
          transactions.push(transaction);
        } catch (error) {
          this.logger.error(`Failed to parse email: ${error.message}`);
        }
      }

      return transactions;
    } finally {
      await this.imapClient.disconnect();
    }
  }
} 