import { Controller, Query, Get, Res } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { FastifyReply } from 'fastify'
import { UsersService } from '@jnscas/cy/src/domain/users/users.service'
import { TokenEncryptionService } from '@jnscas/cy/src/infrastructure/encryption/token-encryption.service'
import { User } from 'src/domain/users/entities/user.entity'

@Controller('auth')
export class OAuth2Controller {
  constructor(
    private readonly oAuth2Client: OAuth2Client,
    private readonly usersService: UsersService,
    private readonly tokenEncryptionService: TokenEncryptionService,
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

  @Get('web/login')
  async webLogin(@Res() res: FastifyReply) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
    })

    return res.send({ authUrl })
  }

  @Get('callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('telegramId') telegramId: string,
    @Res() res: FastifyReply,
  ) {
    const { tokens } = await this.oAuth2Client.getToken(code)

    if (telegramId) {
      return this.callbackTelegram(telegramId, tokens)
    }

    const email = await this.callbackEmail(tokens)

    res.header('Set-Cookie', [
      `auth-token=${tokens.access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      `email=${email}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ])

    res.header('Location', 'http://localhost:3001/')
    res.status(302).send()
  }

  private async callbackEmail(tokens: any): Promise<string> {
    const userInfo = await this.oAuth2Client.getTokenInfo(tokens.access_token)
    const email = userInfo.email

    const user = await this.usersService.getUserByEmail(email)
    if (!user) {
      const userName = email.split('@')[0]
      await this.usersService.createUser(User.create(userName, true, email))
    }
    return email
  }

  private async callbackTelegram(telegramId: string, tokens: any): Promise<string> {
    const user = await this.usersService.getUserByTelegramId(telegramId)
    if (!user) {
      throw new Error('User not found')
    }
    const encryptedAccessToken = this.tokenEncryptionService.encrypt(tokens.access_token)
    const encryptedRefreshToken = this.tokenEncryptionService.encrypt(tokens.refresh_token)

    await this.usersService.enableAutoExpense(user.id, encryptedAccessToken, encryptedRefreshToken)
    return 'Authentication successful! You can return to the bot.'
  }
}
