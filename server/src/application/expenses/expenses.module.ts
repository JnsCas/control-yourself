import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from '@jnscas/cy/src/domain/expenses/expenses.service';
import { ExpensesController } from '@jnscas/cy/src/application/expenses/expenses.controller';
import { ExpenseSchema } from '@jnscas/cy/src/domain/expenses/expense.schema';
import { ExpenseRepository } from '@jnscas/cy/src/domain/expenses/expense.repository';
import { Expense } from "@jnscas/cy/src/domain/expenses/entities/expense.entity";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }])
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpenseRepository],
  exports: [ExpensesService]
})
export class ExpensesModule {} 