import { UsersService } from '@jnscas/cy/src/domain/users/users.service'
import { TokenEncryptionService } from '@jnscas/cy/src/infrastructure/encryption/token-encryption.service'
import { Controller, Get, Post, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyReply } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { User } from 'src/domain/users/entities/user.entity'

@Controller('auth')
export class OAuth2Controller {
  constructor(
    private readonly oAuth2Client: OAuth2Client,
    private readonly usersService: UsersService,
    private readonly tokenEncryptionService: TokenEncryptionService,
    private readonly configService: ConfigService,
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

  @Post('logout')
  async logout(@Res() res: FastifyReply) {
    const isProduction = this.configService.get('NODE_ENV') === 'production'

    res.header('Set-Cookie', [
      `Authorization=; Path=/; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`,
      `email=; Path=/; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`,
    ])

    return res.send({ message: 'Logged out successfully' })
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

    const isProduction = this.configService.get('NODE_ENV') === 'production'

    res.header('Set-Cookie', [
      `Authorization=Bearer ${tokens.access_token}; Path=/; Max-Age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`,
      `email=${email}; Path=/; Max-Age=3600; SameSite=Lax${isProduction ? '; Secure' : ''}`,
    ])

    res.header('Location', `${this.configService.get('CLIENT_URL')}/`)
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
