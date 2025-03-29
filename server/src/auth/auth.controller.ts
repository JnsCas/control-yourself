import { Controller, Get, Query } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GmailService } from '../gmail/gmail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly gmailService: GmailService,
  ) {}

  @Get('callback')
  async handleGoogleCallback(@Query('code') code: string) {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Here you should store tokens.access_token and tokens.refresh_token
    // associated with the user's Telegram ID
    
    // Test fetching emails
    const emails = await this.gmailService.fetchEmails(tokens.access_token);
    
    return 'Authentication successful! You can return to the bot.';
  }
} 