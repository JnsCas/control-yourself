import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
} 