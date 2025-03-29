import { Injectable } from '@nestjs/common';
import { GmailClientAbstract } from './gmail.client.abstract';

@Injectable()
export class GmailService {
  constructor(private readonly gmailClient: GmailClientAbstract) {}

  async fetchEmails(accessToken: string) {
    const query = `from:${process.env.EMAIL_FROM} subject:${process.env.EMAIL_SUBJECT} is:unread`;
    const response = await this.gmailClient.listMessages(accessToken, query);

    const emails = [];
    for (const message of response.data.messages || []) {
      const email = await this.gmailClient.getMessage(accessToken, message.id);
      emails.push(this.parseEmailData(email.data));
    }

    return emails;
  }

  private parseEmailData(emailData: any) {
    const headers = emailData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject').value;
    const from = headers.find(h => h.name === 'From').value;
    
    return {
      id: emailData.id,
      subject,
      from,
      body: this.parseEmailBody(emailData.payload),
      date: new Date(parseInt(emailData.internalDate)),
    };
  }

  private parseEmailBody(payload: any): string {
    if (payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return '';
  }
} 