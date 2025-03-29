import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  
  private readonly httpClient: AxiosInstance

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.API_URL,
    });
  }

  async processNewEmails() {
    const response = await this.httpClient.get('/emails/process');
    return response.data;
  }

  async createUser(telegramId: string, username: string) {
    const response = await this.httpClient.post('/users', {
      telegramId,
      username,
    });
    return response.data;
  }

  async getUser(telegramId: string) {
    const response = await this.httpClient.get(`/users/${telegramId}`);
    return response.data;
  }

  async createExpense(expenseData: {
    userId: string;
    amount: number;
    merchant: string;
    date: Date;
    type: 'MANUAL' | 'AUTO';
    source?: 'GMAIL';
  }) {
    const response = await this.httpClient.post('/expenses', expenseData);
    return response.data;
  }

  async getExpensesByMonth(userId: string, year: number, month: number) {
    const response = await this.httpClient.get(`/expenses/${userId}/${year}/${month}`);
    return response.data;
  }
}
