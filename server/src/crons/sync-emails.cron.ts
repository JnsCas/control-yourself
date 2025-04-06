import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GmailService } from '../gmail/gmail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SyncEmailsCron implements OnModuleInit {
  private readonly logger = new Logger(SyncEmailsCron.name);

  constructor(
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.logger.log('SyncEmailsCron initialized');
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncEmailsForAllUsers() {
    this.logger.log('Starting email sync cron job');
    try {
      const users = await this.usersService.getUsersWithAutoExpense();
      this.logger.log(`Found ${users.length} users with auto expense enabled`);
      
      await Promise.all(users.map(user => this.usersService.processEmails(user)));

      this.logger.log('Email sync cron job completed successfully');
    } catch (error) {
      this.logger.error('Error in email sync cron job:', error);
    }
  }
} 