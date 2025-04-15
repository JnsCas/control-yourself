import { IsNumberString, IsString } from 'class-validator';

export class GetExpensesByMonthDto {
  @IsString()
  userId: string;

  @IsNumberString()
  year: number;

  @IsNumberString()
  month: number;
} 