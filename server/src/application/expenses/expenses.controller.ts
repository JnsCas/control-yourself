import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ExpensesService } from '@jnscas/cy/src/domain/expenses/expenses.service';
import { CreateExpenseDto } from '@jnscas/cy/src/application/expenses/dtos/create-expense.dto';
import { GetExpensesByMonthDto } from '@jnscas/cy/src/application/expenses/dtos/get-expenses-by-month.dto';
import { Expense } from "@jnscas/cy/src/domain/expenses/entities/expense.entity";

@Controller('expenses')
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    this.logger.log(`Creating expense for user ${createExpenseDto.userId} - Amount: $${createExpenseDto.amount}, Merchant: ${createExpenseDto.merchant}`);
    try {
      const { userId, amount, merchant, date, type, source, currency, cardNumber, emailId } = createExpenseDto;
      const expense = Expense.create(userId, amount, merchant, new Date(date), type, source, currency, cardNumber, emailId);
      const savedExpense = await this.expensesService.create(expense);
      this.logger.log(`Expense created successfully`);
      return savedExpense;
    } catch (error) {
      this.logger.error(`Error creating expense: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':userId/:year/:month')
  async getExpensesByMonth(@Param() params: GetExpensesByMonthDto) {
    this.logger.log(`Fetching expenses for user ${params.userId} - Month: ${params.month}, Year: ${params.year}`);
    try {
      const expenses = await this.expensesService.getExpensesByMonth(params.userId, params.month, params.year);
      this.logger.log(`Found ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      this.logger.error(`Error fetching expenses: ${error.message}`, error.stack);
      throw error;
    }
  }
} 