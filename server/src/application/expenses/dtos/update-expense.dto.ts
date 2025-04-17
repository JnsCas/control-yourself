import { IsInt, Min } from 'class-validator'

export class UpdateExpenseDto {
  @IsInt()
  @Min(2)
  installmentsTotal: number
}
