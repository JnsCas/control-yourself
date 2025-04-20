import { Controller, Query, Get, Res } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { FastifyReply } from 'fastify'
import { UsersService } from '@jnscas/cy/src/domain/users/users.service'

@Controller('auth')
export class OAuth2Controller {
  constructor(
    private readonly oAuth2Client: OAuth2Client,
    private readonly usersService: UsersService,
  ) {}

  @Get('login')
  async login(@Query('telegramId') telegramId: string, @Res() res: FastifyReply) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      prompt: 'consent',
      state: telegramId,
    })

    return res.redirect(authUrl)
  }

  @Get('callback')
  async handleGoogleCallback(@Query('code') code: string, @Query('state') telegramId: string) {
    const { tokens } = await this.oAuth2Client.getToken(code)

    const user = await this.usersService.getUserByTelegramId(telegramId)
    if (!user) {
      throw new Error('User not found')
    }

    await this.usersService.updateUser(user.id, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
    })

    return 'Authentication successful! You can return to the bot.'
  }
}
