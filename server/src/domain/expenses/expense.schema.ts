import { ExpenseCurrency, ExpenseSource, ExpenseSourceType } from '@jnscas/cy/src/domain/expenses/expense.types'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'

class InstallmentDocument {
  @Prop({ required: true, type: Number })
  installmentNumber: number

  @Prop({ required: true, type: Number })
  amount: number

  @Prop({ required: true, type: Date })
  dueDate: Date
}

@Schema({ timestamps: true })
class Expense {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  userId: string

  @Prop({ required: true, type: Number })
  amount: number

  @Prop({ required: true })
  merchant: string

  @Prop({ required: true, type: Date })
  date: Date

  @Prop({ required: true, enum: ExpenseSourceType })
  sourceType: ExpenseSourceType

  @Prop({ required: true, enum: ExpenseSource })
  source: ExpenseSource

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date

  @Prop({ required: true, enum: ExpenseCurrency })
  currency: ExpenseCurrency

  @Prop({ type: MongooseSchema.Types.String })
  cardNumber?: string

  @Prop({ type: MongooseSchema.Types.String })
  emailId?: string

  @Prop({ type: [InstallmentDocument] })
  installments: InstallmentDocument[]
}

export type ExpenseDocument = Expense & Document
export const ExpenseSchema = SchemaFactory.createForClass(Expense)
