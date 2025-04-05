import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail';
import { GmailClientAbstract } from "src/gmail/gmail.client.abstract";
import { UsersService } from '../users/users.service';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class GmailClient extends GmailClientAbstract {
  private readonly gmail: gmail_v1.Gmail;

  constructor(
    private readonly oauth2Client: OAuth2Client,
    private readonly usersService: UsersService
  ) {
    super();
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async fetchEmails(user: User): Promise<any[]> {
    const userId = user._id.toString();
    const accessToken = user.googleAccessToken;
    if (!accessToken || !user.googleRefreshToken) {
      throw new Error('User not found or missing refresh token');
    }

    const query = `from:${process.env.EMAIL_FROM} subject:${process.env.EMAIL_SUBJECT} is:unread`;

    try {
      // Set credentials with both access token and refresh token
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: user.googleRefreshToken
      });

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
      });

      // If we got here, the request was successful
      // Check if tokens were refreshed
      const currentCredentials = this.oauth2Client.credentials;
      if (currentCredentials.access_token !== accessToken) {
        // Token was refreshed, update in database
        await this.usersService.updateUserById(userId, {
          googleAccessToken: currentCredentials.access_token
        });
      }

      return response.data.messages || [];
    } catch (error) {
      if (error.message?.includes('Invalid Credentials')) {
        return this.retry(userId, () => this.gmail.users.messages.list({
          userId: 'me',
          q: query,
        }));  
      }
      throw error;
    }
  }


  async fetchMessage(user: User, messageId: string): Promise<any> {
    const userId = user._id.toString();
    if (!user || !user.googleRefreshToken) {
      throw new Error('User not found or missing refresh token');
    }

    try {
      // Set credentials with both access token and refresh token
      this.oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken
      });

      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      // Check if tokens were refreshed
      const currentCredentials = this.oauth2Client.credentials;
      if (currentCredentials.access_token !== user.googleAccessToken) {
        // Token was refreshed, update in database
        await this.usersService.updateUserById(userId, {
          googleAccessToken: currentCredentials.access_token
        });
      }

      return response.data;
    } catch (error) {
      if (error.message?.includes('Invalid Credentials')) {
        return this.retry(userId, () => this.gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full'
        }));
      }
      throw error;
    }
  }

  private async retry(userId: string, callback: () => Promise<any>) {
    try {
      await this.oauth2Client.refreshAccessToken();
      const newCredentials = this.oauth2Client.credentials;
      
      await this.usersService.updateUserById(userId, {
        googleAccessToken: newCredentials.access_token
      });

      const response = await callback();

      return response.data;
    } catch (refreshError) {
      throw new Error(`Failed to refresh token: ${refreshError.message}`);
    }
  }
} 