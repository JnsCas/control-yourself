'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseList from "./ExpenseList";

interface Expense {
  id: string;
  amount: number;
  merchant: string;
  date: string;
  currency: string;
  installments: Array<{
    number: number;
    amount: number;
    dueDate: string;
  }>;
}

interface ExpensesDisplayProps {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  selectedMonth: string;
}

export default function ExpensesDisplay({ expenses, loading, error, selectedMonth }: ExpensesDisplayProps) {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const [year, month] = selectedMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading expenses...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Expenses Found</CardTitle>
          <CardDescription>
            No expenses found for {monthName} {year}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ExpenseList 
      expenses={expenses}
      totalAmount={totalAmount}
      month={monthName}
      year={year}
    />
  );
} 