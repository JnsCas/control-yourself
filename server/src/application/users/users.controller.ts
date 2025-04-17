import { CreateUserDto } from '@jnscas/cy/src/application/users/dtos/create-user.dto'
import { User } from '@jnscas/cy/src/domain/users/entities/user.entity'
import { UsersService } from '@jnscas/cy/src/domain/users/users.service'
import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Param, Post } from '@nestjs/common'

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Creating user', { createUserDto })
    const { username, telegramId } = createUserDto

    if (telegramId) {
      const existingUserByTelegram = await this.usersService.getUserByTelegramId(telegramId)
      if (existingUserByTelegram) {
        throw new BadRequestException('User with this telegramId already exists')
      }
    }

    const user = User.create(username, false, telegramId)
    const savedUser = await this.usersService.createUser(user)

    this.logger.log('User created', { savedUser })
    return savedUser
  }

  @Get(':telegramId')
  async getUser(@Param('telegramId') telegramId: string) {
    this.logger.log('Getting user by telegramId', { telegramId })
    const user = await this.usersService.getUserByTelegramId(telegramId)
    this.logger.log('User found', { user })
    return user
  }

  @Post(':userId/sync-emails')
  async syncEmails(@Param('userId') userId: string) {
    this.logger.log('Syncing emails for user', { userId })
    const user = await this.usersService.getUserById(userId)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.usersService.processEmails(user)
    this.logger.log('Emails synced successfully', { userId })
    return { message: 'Emails synced successfully' }
  }
}
