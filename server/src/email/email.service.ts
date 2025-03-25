import { Injectable, Logger } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';
import { GmailService } from '../gmail/gmail.service';
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly emailParser: EmailParserService,
  ) {}

  async processNewEmails() {
    const emails = await this.gmailService.fetchEmails('access_token'); //FIXME
    
    const transactions = [];
    for (const email of emails) {
      try {
        const transaction = this.emailParser.parseEmailContent(email.text);
        transactions.push(transaction);
      } catch (error) {
        this.logger.error(`Failed to parse email: ${error.message}`);
      }
    }

    return transactions;
  }
} 