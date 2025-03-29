import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ExpenseDocument = Expense & Document;

export enum ExpenseType {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO'
}

export enum ExpenseSource {
  GMAIL = 'GMAIL'
}

@Schema({ timestamps: true })
export class Expense {
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
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense); 