import { Injectable, Logger } from '@nestjs/common';
import { GmailClientAbstract } from './gmail.client.abstract';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(private readonly gmailClient: GmailClientAbstract) {}

  async fetchEmails(user: User) {
    const userId = user._id.toString(); 
    this.logger.log(`Fetching emails for userId ${userId}`);
    
    try {
      const messageList = await this.gmailClient.fetchEmails(user);
      this.logger.log(`Retrieved ${messageList?.length || 0} message IDs for userId ${userId}`);

      const emails = [];
      for (const message of messageList) {
        try {
          this.logger.debug(`Raw message structure: ${JSON.stringify(message, null, 2)}`);

          if (!message?.id) {
            this.logger.warn(`Skipping message without ID for userId ${userId}`);
            continue;
          }

          const fullMessage = await this.gmailClient.fetchMessage(user, message.id);
          this.logger.debug(`Full message structure: ${JSON.stringify(fullMessage, null, 2)}`);

          const parsedEmail = this.parseEmailData(fullMessage);
          emails.push(parsedEmail);
          this.logger.debug(`Successfully parsed email: ${JSON.stringify(parsedEmail, null, 2)}`);
        } catch (error) {
          this.logger.error(
            `Failed to parse email message for userId ${userId}:`,
            error.stack || error.message
          );
          this.logger.debug(`Message that failed to parse: ${JSON.stringify(message, null, 2)}`);
        }
      }

      this.logger.log(`Successfully parsed ${emails.length} emails for userId ${userId}`);
      return emails;
    } catch (error) {
      this.logger.error(
        `Error fetching emails for userId ${userId}:`,
        error.stack || error.message
      );
      throw error;
    }
  }

  private parseEmailData(emailData: any) {
    if (!emailData) {
      throw new Error('Email data is null or undefined');
    }

    if (!emailData.payload) {
      throw new Error(`Invalid email data structure: missing payload. Email ID: ${emailData.id}`);
    }

    return {
      id: emailData.id,
      body: this.parseEmailBody(emailData.payload),
      date: new Date(parseInt(emailData.internalDate)),
    };
  }

  private parseEmailBody(payload: any): string {
    if (!payload) {
      throw new Error('Invalid payload: payload is null or undefined');
    }

    this.logger.debug(`Parsing email body from payload: ${JSON.stringify(payload, null, 2)}`);

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }

      this.logger.debug(
        `No text/plain part found. Available parts: ${payload.parts.map((p: any) => p.mimeType).join(', ')}`
      );
    }

    throw new Error(
      `Could not find email body in plain text format. ` +
      `Payload structure: hasBody=${!!payload.body}, hasParts=${!!payload.parts}`
    );
  }
} 