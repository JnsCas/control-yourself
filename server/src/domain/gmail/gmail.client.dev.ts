import { Injectable, Logger } from "@nestjs/common";
import { GmailClientAbstract } from "@jnscas/cy/src/domain/gmail/gmail.client.abstract";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { User } from "@jnscas/cy/src/domain/users/entities/user.entity";
const logger = new Logger('GmailClientDev');

@Injectable()
export class GmailClientDev extends GmailClientAbstract {

  private readonly client: AxiosInstance;
  
  constructor(private readonly configService: ConfigService) {
    super();
    const host = this.configService.get("IMAP_HOST");
    const port = this.configService.get("MOCKSERVER_PORT");
    this.client = axios.create({ baseURL: `${host}:${port}/imap` });
  }
  
  async fetchEmailsIds(user: User): Promise<any[]> {
    logger.log("IMAP Client Dev fetching unread emails");
    const { status, data } = await this.client.get("/emails/unread");
    if (status !== 200) {
      throw new Error("Failed to fetch unread emails from IMAP Client Dev");
    }
    return data;
  }

  async fetchMessage(user: User, messageId: string): Promise<any> {
    logger.log(`IMAP Client Dev fetching message ${messageId}`);
    // In development, we'll return a mock message structure that matches Gmail's format
    return {
      id: messageId,
      threadId: `thread_${messageId}`,
      labelIds: ['UNREAD', 'INBOX'],
      snippet: 'Transaction Alert: A purchase has been made...',
      payload: {
        mimeType: 'multipart/alternative',
        headers: [
          { name: 'From', value: process.env.EMAIL_FROM || 'visa@notifications.visa.com' },
          { name: 'Subject', value: process.env.EMAIL_SUBJECT || 'Transaction Alert' },
          { name: 'Date', value: new Date().toISOString() }
        ],
        parts: [
          {
            mimeType: 'text/plain',
            body: {
              data: Buffer.from('Amount: 50.00\nMerchant: Test Store\nDate: 2024-03-20').toString('base64')
            }
          }
        ]
      },
      internalDate: Date.now().toString()
    };
  }
}