import { ExpenseDocument } from '@jnscas/cy/src/domain/expenses/expense.schema'
import { ExpenseCurrency, ExpenseSource, ExpenseSourceType } from '@jnscas/cy/src/domain/expenses/expense.types'
import { MongoIdManager } from '@jnscas/cy/src/domain/mongo/MongoIdManager'
import { Installment } from '@jnscas/cy/src/domain/expenses/entities/installment.entity'

export class Expense {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly amount: number,
    readonly merchant: string,
    readonly date: Date,
    readonly sourceType: ExpenseSourceType,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly source: ExpenseSource,
    readonly currency: ExpenseCurrency,
    readonly installments: Installment[],
    readonly cardNumber?: string,
    readonly emailId?: string,
  ) {}

  static create(
    userId: string,
    amount: number,
    merchant: string,
    date: Date,
    sourceType: ExpenseSourceType,
    source: ExpenseSource,
    currency: ExpenseCurrency,
    installmentsTotal?: number,
    cardNumber?: string,
    emailId?: string,
  ): Expense {
    const installments = []
    if (installmentsTotal) {
      const installmentAmount = amount / installmentsTotal
      for (let i = 0; i < installmentsTotal; i++) {
        const dueDate = new Date(date)
        dueDate.setMonth(dueDate.getMonth() + i)
        installments.push(Installment.create(i + 1, installmentAmount, dueDate))
      }
    }
    return new Expense(
      MongoIdManager.randomId(),
      userId,
      amount,
      merchant,
      date,
      sourceType,
      new Date(),
      new Date(),
      source,
      currency,
      installments,
      cardNumber,
      emailId,
    )
  }

  static restore(document: ExpenseDocument): Expense {
    return new Expense(
      document._id.toString(),
      document.userId,
      document.amount,
      document.merchant,
      document.date,
      document.sourceType,
      document.createdAt,
      document.updatedAt,
      document.source,
      document.currency,
      document.installments.map(Installment.restore),
      document.cardNumber,
      document.emailId,
    )
  }

  static restoreList(documents: ExpenseDocument[]): Expense[] {
    return documents.map((document) => this.restore(document))
  }

  toDocument(): Partial<ExpenseDocument> {
    return {
      userId: this.userId,
      amount: this.amount,
      merchant: this.merchant,
      date: this.date,
      sourceType: this.sourceType,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      currency: this.currency,
      cardNumber: this.cardNumber,
      emailId: this.emailId,
      installments: this.installments,
    }
  }
}
