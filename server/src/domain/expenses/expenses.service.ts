import { Expense } from '@jnscas/cy/src/domain/expenses/entities/expense.entity'
import { ExpenseRepository } from '@jnscas/cy/src/domain/expenses/expense.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name)

  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async create(expense: Expense): Promise<Expense> {
    this.logger.debug('Creating expense with data:', expense)
    await this.expenseRepository.save(expense)
    this.logger.debug('Expense saved successfully:', { id: expense.id })
    return expense
  }

  async getExpensesByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
    this.logger.debug(`Finding expenses for user ${userId} in ${month}/${year}`)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    this.logger.debug(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

    const expenses = await this.expenseRepository.findByDateRange(userId, startDate, endDate)
    this.logger.debug(`Found ${expenses.length} expenses`)
    return expenses
  }

  async updateExpense(expenseId: string, installmentsTotal: number): Promise<Expense> {
    this.logger.debug(`Updating expense ${expenseId}`, installmentsTotal)

    const expense = await this.expenseRepository.findById(expenseId)
    if (!expense) {
      this.logger.warn(`Expense not found: ${expenseId}`)
      throw new NotFoundException(`Expense with ID ${expenseId} not found`)
    }

    return this.expenseRepository.update(expense.updateInstallments(installmentsTotal))
  }
}
