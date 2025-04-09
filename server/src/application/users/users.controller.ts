import { Controller, Post, Body, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../domain/users/users.service';
import { GmailService } from '../../domain/gmail/gmail.service';
import { Logger } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly gmailService: GmailService
  ) {}

  @Post()
  async createUser(
    @Body() createUserDto: { username: string; telegramId?: string }
  ) {
    this.logger.log('Creating user', { createUserDto });
    if (createUserDto.telegramId) {
      const existingUserByTelegram = await this.usersService.getUserByTelegramId(createUserDto.telegramId);
      if (existingUserByTelegram) {
        throw new BadRequestException('User with this telegramId already exists');
      }
    }

    const user = await this.usersService.createUser(
      createUserDto.username,
      createUserDto.telegramId
    );
    this.logger.log('User created', { user });
    return user;
  }

  @Get(':telegramId')
  async getUser(@Param('telegramId') telegramId: string) {
    this.logger.log('Getting user by telegramId', { telegramId });
    const user = await this.usersService.getUserByTelegramId(telegramId);
    this.logger.log('User found', { user });
    return user;
  }

  @Post(':userId/sync-emails')
  async syncEmails(@Param('userId') userId: string) {
    this.logger.log('Syncing emails for user', { userId });
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.processEmails(user);
    this.logger.log('Emails synced successfully', { userId });
    return { message: 'Emails synced successfully' };
  }
} 