import { CreateExpenseDto } from '@jnscas/cy/src/application/controllers/expenses/dtos/create-expense.dto'
import { GetExpensesByMonthDto } from '@jnscas/cy/src/application/controllers/expenses/dtos/get-expenses-by-month.dto'
import { UpdateExpenseDto } from '@jnscas/cy/src/application/controllers/expenses/dtos/update-expense.dto'
import { Expense } from '@jnscas/cy/src/domain/expenses/entities/expense.entity'
import { ExpenseSourceType } from '@jnscas/cy/src/domain/expenses/expense.types'
import { ExpensesService } from '@jnscas/cy/src/domain/expenses/expenses.service'
import { Body, Controller, Get, Logger, Param, Post, Put } from '@nestjs/common'

@Controller('expenses')
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name)

  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    this.logger.log(
      `Creating expense for user ${createExpenseDto.userId} - Amount: $${createExpenseDto.amount}, Merchant: ${createExpenseDto.merchant}`,
    )
    const { userId, amount, merchant, date, source, currency, installmentsTotal } = createExpenseDto
    const expense = Expense.create(
      userId,
      amount,
      merchant,
      new Date(date),
      ExpenseSourceType.MANUAL,
      source,
      currency,
      installmentsTotal,
    )
    const savedExpense = await this.expensesService.create(expense)
    this.logger.log(`Expense created successfully`)
    return savedExpense
  }

  @Get(':userId/:year/:month')
  async getExpensesByMonth(@Param() params: GetExpensesByMonthDto) {
    this.logger.log(`Fetching expenses for user ${params.userId} - Month: ${params.month}, Year: ${params.year}`)
    const expenses = await this.expensesService.getExpensesByMonth(params.userId, params.month, params.year)
    this.logger.log(`Found ${expenses.length} expenses`)
    return expenses
  }

  @Put(':id')
  async updateExpense(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    const { installmentsTotal } = updateExpenseDto
    this.logger.log(`Updating expense ${id} with installments: ${installmentsTotal}`)

    const updatedExpense = await this.expensesService.updateExpense(id, installmentsTotal)

    this.logger.log(`Expense updated successfully`)
    return updatedExpense
  }
}
