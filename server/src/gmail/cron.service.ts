import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GmailService } from './gmail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class GmailCronService implements OnModuleInit {
  private readonly logger = new Logger(GmailCronService.name);

  constructor(
    private readonly gmailService: GmailService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.logger.log('GmailCronService initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncEmailsForAllUsers() {
    this.logger.log('Starting email sync cron job');
    try {
      // Get all users who have Google tokens
      const users = await this.usersService.getUsersWithGoogleTokens();
      this.logger.log(`Found ${users.length} users with Google tokens`);
      
      for (const user of users) {
        try {
          if (!user.googleAccessToken) continue;
          
          // Fetch emails for this user
          const emails = await this.gmailService.fetchEmails(user);
          
          // Here you can process the emails as needed
          // For example, store them in your database or send notifications
          this.logger.log(`Synced ${emails.length} emails for user ${user.telegramId}`);
        } catch (error) {
          this.logger.error(`Error syncing emails for user ${user.telegramId}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error in email sync cron job:', error);
    }
  }
} 