import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument, ExpenseType, ExpenseSource } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>
  ) {}

  async createExpense(expenseData: {
    userId: string;
    amount: number;
    merchant: string;
    date: Date;
    type: ExpenseType;
    source?: ExpenseSource;
  }): Promise<Expense> {
    const expense = new this.expenseModel(expenseData);
    return expense.save();
  }

  async getExpensesByMonth(userId: string, year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.expenseModel.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });
  }

  async getTotalExpensesByMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
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