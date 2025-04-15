import { ExpenseCurrency, ExpenseSource } from '@jnscas/cy/src/domain/expenses/expense.types'
import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator'

export class CreateExpenseDto {
  @IsString()
  userId: string

  @IsNumber()
  amount: number

  @IsString()
  merchant: string

  @IsDateString()
  date: string

  @IsEnum(ExpenseSource)
  source: ExpenseSource

  @IsEnum(ExpenseCurrency)
  currency: ExpenseCurrency
}
