import { ExpenseCurrency, ExpenseSource } from '@jnscas/cy/src/domain/expenses/expense.types'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'

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

  @IsNumber()
  @Min(2)
  @IsOptional()
  installmentsTotal?: number
}
