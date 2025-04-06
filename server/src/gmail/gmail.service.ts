import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { GmailClientAbstract } from './gmail.client.abstract';
import { GetMessageResponse } from './responses/get-message.response';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(
    private readonly gmailClient: GmailClientAbstract
  ) {}

  /**
   * Fetches new emails ids since the last sync date
   * @param user 
   * @returns 
   */
  async fetchNewEmailsIds(user: User): Promise<string[]> {
    const userId = user._id.toString(); 
    const lastSync = user.lastEmailSync;
    this.logger.log(`Fetching emails for userId ${userId} since ${lastSync?.toISOString() || 'all time'}`);

    const messageList = await this.gmailClient.fetchEmailsIds(user, lastSync);
    this.logger.log(`Retrieved ${messageList?.length || 0} message IDs for userId ${userId} and since ${lastSync?.toISOString() || 'all time'}`);
    return messageList;
  }

  async fetchMessage(user: User, messageId: string): Promise<GetMessageResponse> {
    this.logger.log(`Fetching message for userId ${user._id} and messageId ${messageId}`);
    const messageResponse = await this.gmailClient.fetchMessage(user, messageId);
    this.logger.log(`Successfully fetched message for userId ${user._id} and messageId ${messageId}`);
    return messageResponse;
  }
} 