import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { GmailService } from '../gmail/gmail.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gmailService: GmailService
  ) {}

  @Post()
  async createUser(
    @Body() createUserDto: { telegramId: string; username: string }
  ) {
    return this.usersService.createUser(
      createUserDto.telegramId,
      createUserDto.username
    );
  }

  @Get(':telegramId')
  async getUser(@Param('telegramId') telegramId: string) {
    return this.usersService.getUserByTelegramId(telegramId);
  }

  @Post(':userId/sync-emails')
  async syncEmails(@Param('userId') userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.processEmails(user);

    return { message: 'Emails synced successfully' };
  }
} 