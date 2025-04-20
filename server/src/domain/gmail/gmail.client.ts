import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { gmail_v1 } from 'googleapis/build/src/apis/gmail'
import { User } from '@jnscas/cy/src/domain/users/entities/user.entity'
import { GetMessageResponse } from '@jnscas/cy/src/domain/gmail/responses/get-message.response'

@Injectable()
export class GmailClient {
  private readonly gmail: gmail_v1.Gmail

  constructor(private readonly oauth2Client: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  async fetchEmailsIds(user: User, sinceDate?: Date): Promise<string[]> {
    return this.executeWithRetry(user, async () => {
      let query = `from:${process.env.EMAIL_FROM} subject:${process.env.EMAIL_SUBJECT}`
      if (sinceDate) {
        query += ` after:${Math.floor(sinceDate.getTime() / 1000)}`
      }

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
      })

      return (response.data.messages || []).map((message) => message.id)
    })
  }

  async fetchMessage(user: User, messageId: string): Promise<GetMessageResponse> {
    return this.executeWithRetry(user, async () => {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      return response.data as GetMessageResponse
    })
  }

  private async executeWithRetry<T>(user: User, operation: () => Promise<T>, retryCount = 0): Promise<T> {
    const MAX_RETRIES = 2

    try {
      await this.setCredentials(user)
      return await operation()
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.isTokenError(error)) {
        console.log(`Token error detected, retrying operation (${retryCount + 1}/${MAX_RETRIES})`)
        // Force token refresh on next attempt
        try {
          await this.oauth2Client.refreshAccessToken()
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
        }
        return this.executeWithRetry(user, operation, retryCount + 1)
      }
      throw error
    }
  }

  private isTokenError(error: any): boolean {
    // Standard OAuth 2.0 error responses
    return (
      // 401 Unauthorized - Invalid credentials
      error?.response?.status === 401 ||
      // Standard OAuth error types
      error?.message?.includes('invalid_token') ||
      error?.message?.includes('invalid_grant') ||
      error?.message?.includes('unauthorized_client') ||
      // Additional common Google OAuth errors
      error?.code === 'ENOTFOUND' || // DNS lookup failed
      // Check for token revocation or expiration messages
      error?.message?.includes('token expired') ||
      error?.message?.includes('token revoked') ||
      error?.message?.includes('Token has been expired or revoked')
    )
  }

  private async setCredentials(user: User) {
    const { googleAccessToken, googleRefreshToken } = user
    if (!googleAccessToken || !googleRefreshToken) {
      throw new Error('User missing access token or refresh token')
    }

    this.oauth2Client.setCredentials({
      access_token: googleAccessToken,
      refresh_token: googleRefreshToken,
    })
  }
}
