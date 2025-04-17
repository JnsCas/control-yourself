import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ExpenseDocument } from '@jnscas/cy/src/domain/expenses/expense.schema'
import { Expense } from '@jnscas/cy/src/domain/expenses/entities/expense.entity'

@Injectable()
export class ExpenseRepository {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>) {}

  async save(expense: Expense): Promise<Expense> {
    await new this.expenseModel(expense.toDocument()).save()
    return expense
  }

  async findById(id: string): Promise<Expense | null> {
    const document = await this.expenseModel.findById(id).exec()
    return document ? Expense.restore(document) : null
  }

  async update(expense: Expense): Promise<Expense> {
    await this.expenseModel.findByIdAndUpdate(expense.id, { $set: { ...expense.toDocument() } }).exec()
    return expense
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    const results = await this.expenseModel
      .find({
        userId: userId,
        $or: [
          {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
          {
            installments: {
              $elemMatch: {
                dueDate: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          },
        ],
      })
      .sort({ date: -1 })
      .exec()

    return results.map(Expense.restore)
  }
}
