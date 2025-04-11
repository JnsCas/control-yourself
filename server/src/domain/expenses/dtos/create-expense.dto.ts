import { ExpenseCurrency, ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/types/expense.types';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  merchant: string;

  @IsDateString()
  date: string;

  @IsEnum(ExpenseType)
  type: ExpenseType;

  @IsEnum(ExpenseSource)
  source: ExpenseSource;

  @IsEnum(ExpenseCurrency)
  currency: ExpenseCurrency;

  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  @IsOptional()
  emailId?: string;
}