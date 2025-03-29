import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail';

@Injectable()
export class GmailClient {
  private readonly gmail: gmail_v1.Gmail;

  constructor(private readonly oauth2Client: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async listMessages(accessToken: string, query: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    return this.gmail.users.messages.list({
      userId: 'me',
      q: query,
    });
  }

  async getMessage(accessToken: string, messageId: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    return this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
  }
} 