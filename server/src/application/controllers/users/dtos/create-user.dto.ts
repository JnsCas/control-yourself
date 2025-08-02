import { IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @IsString()
  username: string

  @IsString()
  @IsOptional()
  telegramId?: string
}
