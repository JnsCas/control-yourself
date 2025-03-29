export enum ExpenseType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum ExpenseSource {
  GMAIL = 'gmail',
  WEB = 'website',
}

export interface CreateExpenseDto {
  userId: string;
  amount: number;
  merchant: string;
  date: Date;
  type: ExpenseType;
  source: ExpenseSource;
}