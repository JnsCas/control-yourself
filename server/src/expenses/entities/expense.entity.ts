import { CreateExpenseDto, ExpenseSource, ExpenseType } from '../types/expense.types';
import { ExpenseDocument } from '../schemas/expense.schema';
import { MongoIdManager } from "src/mongo/MongoIdManager";

export class Expense {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly amount: number,
    readonly merchant: string,
    readonly date: Date,
    readonly type: ExpenseType,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly source?: ExpenseSource,
  ) {}

  static create(createExpenseDto: CreateExpenseDto): Expense {
    return new Expense(
      MongoIdManager.randomId(),
      createExpenseDto.userId,
      createExpenseDto.amount,
      createExpenseDto.merchant,
      createExpenseDto.date,
      createExpenseDto.type,
      new Date(),
      new Date(),
      createExpenseDto.source
    );
  }

  static restore(document: ExpenseDocument): Expense {
    return new Expense(
      document._id.toString(),
      document.userId,
      document.amount,
      document.merchant,
      document.date,
      document.type,
      document.date,
      document.updatedAt,
      document.source
    )
  }

  static restoreList(documents: ExpenseDocument[]): Expense[] {
    return documents.map(document => this.restore(document));
  }

  toDocument(): {
    userId: string;
    amount: number;
    merchant: string;
    date: Date;
    type: ExpenseType;
    source?: ExpenseSource;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      userId: this.userId,
      amount: this.amount,
      merchant: this.merchant,
      date: this.date,
      type: this.type,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 