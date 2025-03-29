import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from "src/expenses/types/expense.types";

@Controller('expenses')
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    this.logger.log(`Creating expense for user ${createExpenseDto.userId} - Amount: $${createExpenseDto.amount}, Merchant: ${createExpenseDto.merchant}`);
    try {
      const expense = await this.expensesService.create(createExpenseDto);
      this.logger.log(`Expense created successfully`);
      return expense;
    } catch (error) {
      this.logger.error(`Error creating expense: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':userId/:year/:month')
  async getExpensesByMonth(
    @Param('userId') userId: string,
    @Param('year') year: number,
    @Param('month') month: number
  ) {
    this.logger.log(`Fetching expenses for user ${userId} - Month: ${month}, Year: ${year}`);
    try {
      const expenses = await this.expensesService.getExpensesByMonth(userId, month, year);
      this.logger.log(`Found ${expenses.length} expenses`);
      return expenses;
    } catch (error) {
      this.logger.error(`Error fetching expenses: ${error.message}`, error.stack);
      throw error;
    }
  }
} 