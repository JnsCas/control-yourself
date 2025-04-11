import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ExpenseCurrency, ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/types/expense.types';

@Schema({ timestamps: true })
class Expense {
  @Prop({ required: true, type: MongooseSchema.Types.String })
  userId: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  merchant: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, enum: ExpenseType })
  type: ExpenseType;

  @Prop({ required: true, enum: ExpenseSource })
  source: ExpenseSource;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ required: true, enum: ExpenseCurrency })
  currency: ExpenseCurrency;

  @Prop({ type: MongooseSchema.Types.String })
  cardNumber?: string;

  @Prop({ type: MongooseSchema.Types.String })
  emailId?: string;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);