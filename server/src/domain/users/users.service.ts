import { Injectable, Logger } from '@nestjs/common'
import { EmailParser } from '@jnscas/cy/src/domain/email/email.parser'
import { ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/expense.types'
import { ExpensesService } from '@jnscas/cy/src/domain/expenses/expenses.service'
import { GmailService } from '@jnscas/cy/src/domain/gmail/gmail.service'
import { User } from '@jnscas/cy/src/domain/users/entities/user.entity'
import { UserRepository } from '@jnscas/cy/src/domain/users/user.repository'
import { Expense } from '@jnscas/cy/src/domain/expenses/entities/expense.entity'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private readonly userRepository: UserRepository,
    private readonly gmailService: GmailService,
    private readonly expenseService: ExpensesService,
    private readonly emailParser: EmailParser,
  ) {}

  async createUser(user: User): Promise<User> {
    this.logger.log(`Creating user ${user.id}`)
    return this.userRepository.save(user)
  }

  async processEmails(user: User): Promise<void> {
    const newEmailsIds = await this.gmailService.fetchNewEmailsIds(user)
    for (const emailId of newEmailsIds) {
      const messageResponse = await this.gmailService.fetchMessage(user, emailId)
      const parsedEmail = this.emailParser.parseEmailData(messageResponse)
      if (!parsedEmail) {
        this.logger.log(`Skipping non-accepted transaction for email ID: ${emailId}`)
        continue
      }
      const expense = Expense.create(
        user.id,
        parsedEmail.amount,
        parsedEmail.merchant,
        new Date(parsedEmail.date),
        ExpenseType.AUTO,
        ExpenseSource.GMAIL,
        parsedEmail.currency,
        parsedEmail.cardNumber,
        parsedEmail.id,
      )
      await this.expenseService.create(expense)
    }
    await this.userRepository.updateLastEmailSync(user.id)
    this.logger.log(`Synced ${newEmailsIds.length} new emails for user ${user.id}`)
  }

  async getUserByTelegramId(telegramId?: string): Promise<User | null> {
    return this.userRepository.findOneByTelegramId(telegramId)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneByUsername(username)
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    return this.userRepository.updateById(id, updateData)
  }

  async getUsersWithAutoExpense(): Promise<User[]> {
    return this.userRepository.findUsersWithAutoExpense()
  }
}
