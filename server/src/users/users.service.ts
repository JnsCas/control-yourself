import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { GmailService } from '../gmail/gmail.service';
import { ExpensesService } from '../expenses/expenses.service';
import { ParsedEmailTransaction } from 'src/email/email.parser';
import { ExpenseSource, ExpenseType } from 'src/expenses/types/expense.types';
import { EmailParser } from 'src/email/email.parser';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly gmailService: GmailService,
    private readonly expenseService: ExpensesService,
    private readonly emailParser: EmailParser
  ) {}

  async createUser(telegramId: string, username: string): Promise<User> {
    const existingUser = await this.userModel.findOne({ telegramId });
    if (existingUser) {
      return existingUser;
    }

    const user = new this.userModel({
      telegramId,
      username,
      autoExpenseEnabled: false,
    });

    return user.save();
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
        userId: user._id.toString(),
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
    await this.updateLastEmailSync(user._id.toString());
    this.logger.log(`Synced ${newEmailsIds.length} new emails for user ${user._id}`);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramId });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async updateLastEmailSync(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { lastEmailSync: new Date() } },
      { new: true }
    );
  }

  async updateUser(telegramId: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { telegramId },
      { $set: updateData },
      { new: true }
    );
  }

  async updateUserById(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async getUsersWithAutoExpense(): Promise<User[]> {
    return this.userModel.find({ autoExpenseEnabled: true });
  }
} 