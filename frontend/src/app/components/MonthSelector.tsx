'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    return {
      value: `${year}-${month}`,
      label: `${monthName} ${year}`
    };
  });

  return (
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
} 