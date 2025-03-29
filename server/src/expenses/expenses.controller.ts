import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpenseType, ExpenseSource } from './schemas/expense.schema';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async createExpense(
    @Body() createExpenseDto: {
      userId: string;
      amount: number;
      merchant: string;
      date: Date;
      type: ExpenseType;
      source?: ExpenseSource;
    }
  ) {
    return this.expensesService.createExpense(createExpenseDto);
  }

  @Get(':userId/:year/:month')
  async getExpensesByMonth(
    @Param('userId') userId: string,
    @Param('year') year: string,
    @Param('month') month: string
  ) {
    return this.expensesService.getExpensesByMonth(
      userId,
      parseInt(year),
      parseInt(month)
    );
  }
} 