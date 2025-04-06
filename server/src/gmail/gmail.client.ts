import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail';
import { GmailClientAbstract } from "src/gmail/gmail.client.abstract";
import { User } from 'src/users/schemas/user.schema';
import { GetMessageResponse } from './responses/get-message.response';

@Injectable()
export class GmailClient extends GmailClientAbstract {
  private readonly gmail: gmail_v1.Gmail;

  constructor(private readonly oauth2Client: OAuth2Client) {
    super();
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async fetchEmailsIds(user: User, sinceDate?: Date): Promise<string[]> {
    await this.setCredentials(user);

    let query = `from:${process.env.EMAIL_FROM} subject:${process.env.EMAIL_SUBJECT}`;
    if (sinceDate) {
      query += ` after:${Math.floor(sinceDate.getTime() / 1000)}`;
    }

    const response = await this.gmail.users.messages.list({
          userId: 'me',
          q: query,
        });
    
    return (response.data.messages || []).map(message => message.id);
  }

  async fetchMessage(user: User, messageId: string): Promise<GetMessageResponse> {
    await this.setCredentials(user);

    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    return response.data as GetMessageResponse;
  }

  private async setCredentials(user: User) {
    const { googleAccessToken, googleRefreshToken } = user;
    if (!googleAccessToken || !googleRefreshToken) {
      throw new Error('User missing access token or refresh token');
    }

    this.oauth2Client.setCredentials({
      access_token: googleAccessToken,
      refresh_token: googleRefreshToken
    });
    
    await this.oauth2Client.refreshAccessToken();
  }
} 