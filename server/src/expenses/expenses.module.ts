import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpenseSchema } from './schemas/expense.schema';
import { ExpenseRepository } from './repositories/expense.repository';
import { Expense } from "src/expenses/entities/expense.entity";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }])
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpenseRepository],
  exports: [ExpensesService]
})
export class ExpensesModule {} 