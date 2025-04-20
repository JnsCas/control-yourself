import { Injectable, Logger } from '@nestjs/common'
import { GetMessageResponse } from '@jnscas/cy/src/domain/gmail/responses/get-message.response'
import { User } from '@jnscas/cy/src/domain/users/entities/user.entity'
import { GmailClient } from '@jnscas/cy/src/domain/gmail/gmail.client'

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name)

  constructor(private readonly gmailClient: GmailClient) {}

  /**
   * Fetches new emails ids since the last sync date
   * @param user
   * @returns
   */
  async fetchNewEmailsIds(user: User): Promise<string[]> {
    const userId = user.id
    const lastSync = user.lastEmailSync
    this.logger.log(`Fetching emails for userId ${userId} since ${lastSync?.toISOString() || 'all time'}`)

    const messageList = await this.gmailClient.fetchEmailsIds(user, lastSync)
    this.logger.log(
      `Retrieved ${messageList?.length || 0} message IDs for userId ${userId} and since ${lastSync?.toISOString() || 'all time'}`,
    )
    return messageList
  }

  async fetchMessage(user: User, messageId: string): Promise<GetMessageResponse> {
    this.logger.log(`Fetching message for userId ${user.id} and messageId ${messageId}`)
    const messageResponse = await this.gmailClient.fetchMessage(user, messageId)
    this.logger.log(`Successfully fetched message for userId ${user.id} and messageId ${messageId}`)
    return messageResponse
  }
}
