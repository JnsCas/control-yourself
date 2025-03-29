import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ExpenseSource, ExpenseType } from '../types/expense.types';

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

  @Prop({ enum: ExpenseSource })
  source?: ExpenseSource;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export type ExpenseDocument = Expense & Document;
export const ExpenseSchema = SchemaFactory.createForClass(Expense);