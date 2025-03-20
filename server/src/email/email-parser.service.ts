import { Injectable } from '@nestjs/common';

interface ParsedTransaction {
  amount: number;
  merchant: string;
  date: Date;
  currency: string;
}

@Injectable()
export class EmailParserService {
  parseEmailContent(content: string): ParsedTransaction {
    // This is a basic implementation - you'll need to adjust the parsing logic
    // based on your actual email format
    const amountMatch = content.match(/Amount: ([0-9.]+)/);
    const merchantMatch = content.match(/Merchant: (.+)/);
    const dateMatch = content.match(/Date: (.+)/);

    if (!amountMatch || !merchantMatch || !dateMatch) {
      throw new Error('Unable to parse email content');
    }

    return {
      amount: parseFloat(amountMatch[1]),
      merchant: merchantMatch[1].trim(),
      date: new Date(dateMatch[1]),
      currency: 'USD', // You might want to parse this from the email as well
    };
  }
} 