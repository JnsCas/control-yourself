import { OAuth2Client } from 'google-auth-library';

export class GmailAuth {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly']
    });
  }
} 