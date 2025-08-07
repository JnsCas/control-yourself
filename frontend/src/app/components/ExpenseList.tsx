import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface MerchantExpense {
  merchant: string;
  totalAmount: number;
  percentage: number;
  expenses: Expense[];
  installmentsInfo?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  totalAmount: number;
  month: string;
  year: string;
}

export default function ExpenseList({ expenses, totalAmount, month, year }: ExpenseListProps) {
  // Group expenses by merchant
  const merchantExpenses = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.merchant === expense.merchant);
    
    if (existing) {
      existing.totalAmount += expense.amount;
      existing.expenses.push(expense);
    } else {
      acc.push({
        merchant: expense.merchant,
        totalAmount: expense.amount,
        percentage: 0, // Will be calculated below
        expenses: [expense],
        installmentsInfo: expense.installments.length > 1 
          ? `${expense.installments.length}/${expense.installments.length}`
          : undefined
      });
    }
    
    return acc;
  }, [] as MerchantExpense[]);

  // Calculate percentages and sort by amount
  merchantExpenses.forEach(merchant => {
    merchant.percentage = (merchant.totalAmount / totalAmount) * 100;
  });
  
  merchantExpenses.sort((a, b) => b.totalAmount - a.totalAmount);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-600">
          Total ARS: {formatCurrency(totalAmount)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {merchantExpenses.map((merchant, index) => (
            <div key={merchant.merchant} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{merchant.merchant}</span>
                  {merchant.installmentsInfo && (
                    <span className="text-sm text-gray-500">
                      {merchant.installmentsInfo}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(merchant.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ({merchant.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
              
              {/* Show individual expenses if there are multiple for this merchant */}
              {merchant.expenses.length > 1 && (
                <div className="mt-2 ml-4 space-y-1">
                  {merchant.expenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        └─ {expense.merchant}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(expense.amount)}
                        {expense.installments.length > 1 && (
                          <span className="text-gray-400 ml-1">
                            ({expense.installments.length}/{expense.installments.length})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 