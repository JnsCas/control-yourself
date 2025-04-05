import { Controller, Get, Query, Res } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GmailService } from '../gmail/gmail.service';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly gmailService: GmailService,
    private readonly oAuth2Client: OAuth2Client,
    private readonly usersService: UsersService
  ) {}

  @Get('login')
  async login(@Query('telegramId') telegramId: string, @Res() res: Response) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      prompt: 'consent',
      state: telegramId
    });

    res.redirect(authUrl);
  }

  @Get('callback')
  async handleGoogleCallback(@Query('code') code: string, @Query('state') telegramId: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);

    const user = await this.usersService.getUserByTelegramId(telegramId);
    if (!user) {
      throw new Error('User not found');
    }

    // Store tokens for the user
    await this.usersService.updateUser(telegramId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token
    });
    
    return 'Authentication successful! You can return to the bot.';
  }
} 