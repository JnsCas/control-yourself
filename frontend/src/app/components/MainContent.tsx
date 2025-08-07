'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import ExpenseList from "./ExpenseList";
import MonthSelector from './MonthSelector';

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

export default function MainContent() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async (year: string, month: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/expenses/${user.id}/${year}/${month}`);
      
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        setError('Failed to fetch expenses');
        setExpenses([]);
      }
    } catch (err) {
      setError('Error fetching expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth && user) {
      const [year, month] = selectedMonth.split('-');
      fetchExpenses(year, month);
    }
  }, [selectedMonth, user]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Control Yourself</CardTitle>
          <CardDescription>
            Please log in to view your expenses
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const [year, month] = selectedMonth.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Expenses Management</CardTitle>
        <div className="space-y-2">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expenses Display Section */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-4">Loading expenses...</div>
          )}

          {error && (
            <div className="text-center text-red-600 py-4">{error}</div>
          )}

          {!loading && !error && expenses.length === 0 && (
            <div className="text-center py-4">
              <div className="text-lg font-semibold">No Expenses Found</div>
              <div className="text-gray-600">
                No expenses found for {monthName} {year}
              </div>
            </div>
          )}

          {!loading && !error && expenses.length > 0 && (
            <ExpenseList 
              expenses={expenses}
              totalAmount={totalAmount}
              month={monthName}
              year={year}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 