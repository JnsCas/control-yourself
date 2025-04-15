import { Expense } from '@jnscas/cy/src/domain/expenses/entities/expense.entity';
import { ExpenseRepository } from '@jnscas/cy/src/domain/expenses/expense.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private readonly expenseRepository: ExpenseRepository
  ) {}

  async create(expense: Expense): Promise<Expense> {
    this.logger.debug('Creating expense with data:', expense);
    try {
      const savedExpense = await this.expenseRepository.save(expense);
      this.logger.debug('Expense saved successfully:', { id: savedExpense.id });
      return savedExpense;
    } catch (error) {
      this.logger.error(`Failed to create expense: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExpensesByMonth(userId: string, month: number, year: number): Promise<Expense[]> {
    this.logger.debug(`Finding expenses for user ${userId} in ${month}/${year}`);
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      this.logger.debug(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

      const expenses = await this.expenseRepository.findByMonth(userId, startDate, endDate);
      this.logger.debug(`Found ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      this.logger.error(`Failed to fetch expenses: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTotalExpensesByMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.expenseRepository.getTotalByMonth(userId, startDate, endDate);
  }
} 