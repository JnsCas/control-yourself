export enum ExpenseCurrency {
  ARS = 'ARS',
  USD = 'USD',
}

export enum ExpenseType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export enum ExpenseSource {
  GMAIL = 'gmail',
  WEB = 'website',
  TELEGRAM = 'telegram',
}

export interface CreateExpenseDto {
  userId: string;
  amount: number;
  merchant: string;
  date: Date;
  type: ExpenseType;
  source: ExpenseSource;
  currency: ExpenseCurrency;
  cardNumber?: string;
  emailId?: string;
}