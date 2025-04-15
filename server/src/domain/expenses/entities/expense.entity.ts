import { ExpenseDocument } from '@jnscas/cy/src/domain/expenses/expense.schema';
import { ExpenseCurrency, ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/expense.types';
import { MongoIdManager } from '@jnscas/cy/src/domain/mongo/MongoIdManager';

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
    readonly source: ExpenseSource,
    readonly currency: ExpenseCurrency,
    readonly cardNumber?: string,
    readonly emailId?: string,
  ) {}

  static create(userId: string, amount: number, merchant: string, date: Date, type: ExpenseType, source: ExpenseSource, currency: ExpenseCurrency, cardNumber?: string, emailId?: string): Expense {
    return new Expense(
      MongoIdManager.randomId(),
      userId,
      amount,
      merchant,
      date,
      type,
      new Date(),
      new Date(),
      source,
      currency,
      cardNumber,
      emailId
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
      document.createdAt,
      document.updatedAt,
      document.source,
      document.currency,
      document.cardNumber,
      document.emailId
    )
  }

  static restoreList(documents: ExpenseDocument[]): Expense[] {
    return documents.map(document => this.restore(document));
  }

  toDocument(): Partial<ExpenseDocument> {
    return {
      userId: this.userId,
      amount: this.amount,
      merchant: this.merchant,
      date: this.date,
      type: this.type,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      currency: this.currency,
      cardNumber: this.cardNumber,
      emailId: this.emailId
    };
  }
} 