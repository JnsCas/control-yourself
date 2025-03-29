import { Injectable, Logger } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';
import { ExpensesService } from '../expenses/expenses.service';
import { ExpenseSource, ExpenseType } from "src/expenses/types/expense.types";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly emailParser: EmailParserService,
    private readonly expensesService: ExpensesService,
    private readonly usersService: UsersService,
  ) {}

  async processNewEmails() {
    // Get all users with auto-expense enabled
    const users = await this.usersService.getUsersWithAutoExpense();
    
    for (const user of users) {
      try {
        if (!user.googleAccessToken) {
          this.logger.warn(`User ${user.telegramId} has auto-expense enabled but no Google access token`);
          continue;
        }

        // Fetch new emails for this user
        const emails = await this.gmailService.fetchEmails(user.googleAccessToken);
        
        // Process each email
        for (const email of emails) {
          try {
            const transaction = this.emailParser.parseEmailContent(email.body);
            
            // Store the expense
            await this.expensesService.create({
              userId: user.telegramId,
              amount: transaction.amount,
              merchant: transaction.merchant,
              date: transaction.date,
              type: ExpenseType.AUTO,
              source: ExpenseSource.GMAIL
            });

            this.logger.log(`Processed expense for user ${user.telegramId}: ${transaction.amount} at ${transaction.merchant}`);
          } catch (error) {
            this.logger.error(`Failed to process email for user ${user.telegramId}: ${error.message}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to process emails for user ${user.telegramId}: ${error.message}`);
      }
    }
  }
} 