import { Injectable, Logger } from '@nestjs/common';
import { EmailParser } from 'src/domain/email/email.parser';
import { ExpenseSource, ExpenseType } from 'src/domain/expenses/types/expense.types';
import { ExpensesService } from '../expenses/expenses.service';
import { GmailService } from '../gmail/gmail.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly gmailService: GmailService,
    private readonly expenseService: ExpensesService,
    private readonly emailParser: EmailParser
  ) {}

  async createUser(username: string, telegramId?: string): Promise<User> {
    const user = User.create({
      username,
      autoExpenseEnabled: false,
      telegramId,
    });

    return this.userRepository.create(user);
  }

  async processEmails(user: User): Promise<void> {
    const newEmailsIds = await this.gmailService.fetchNewEmailsIds(user);
    for (const emailId of newEmailsIds) {
      const messageResponse = await this.gmailService.fetchMessage(user, emailId);
      const parsedEmail = this.emailParser.parseEmailData(messageResponse);
      if (!parsedEmail) {
        this.logger.log(`Skipping non-accepted transaction for email ID: ${emailId}`);
        continue;
      }
      await this.expenseService.create({
        userId: user.id,
        amount: parsedEmail.amount,
        merchant: parsedEmail.merchant,
        date: parsedEmail.date,
        type: ExpenseType.AUTO, // FIXME
        source: ExpenseSource.GMAIL,
        currency: parsedEmail.currency,
        cardNumber: parsedEmail.cardNumber,
        emailId: parsedEmail.id,
      });
    }
    await this.userRepository.updateLastEmailSync(user.id);
    this.logger.log(`Synced ${newEmailsIds.length} new emails for user ${user.id}`);
  }

  async getUserByTelegramId(telegramId?: string): Promise<User | null> {
    return this.userRepository.findOneByTelegramId(telegramId);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneByUsername(username);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userRepository.updateById(id, updateData);
  }

  async getUsersWithAutoExpense(): Promise<User[]> {
    return this.userRepository.findUsersWithAutoExpense();
  }
} 