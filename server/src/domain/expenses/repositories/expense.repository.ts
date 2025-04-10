import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpenseDocument } from '@jnscas/cy/src/domain/expenses/schemas/expense.schema';
import { Expense } from "@jnscas/cy/src/domain/expenses/entities/expense.entity";

@Injectable()
export class ExpenseRepository {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>
  ) {}

  async create(expense: Expense): Promise<Expense> {
    await new this.expenseModel(expense.toDocument()).save();
    return expense
  }

  async findByMonth(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    const results = await this.expenseModel.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 }).exec();
    return Expense.restoreList(results);
  }

  async getTotalByMonth(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.expenseModel.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result[0]?.total || 0;
  }
} 