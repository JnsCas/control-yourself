import axios, { AxiosInstance } from 'axios'
import { ExpenseCurrency, ExpenseSource } from '../types/expense.types'
import logger from '../utils/logger'

export class ApiClient {
  private readonly httpClient: AxiosInstance

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.API_URL,
    })
  }

  async getAuthUrl(telegramId: string) {
    logger.info('Getting auth URL', { telegramId })
    try {
      const response = await this.httpClient.get(`/auth/login?telegramId=${telegramId}`)
      logger.info('Successfully got auth URL')
      return response.headers.location
    } catch (error) {
      logger.error('Failed to get auth URL', { error })
      throw error
    }
  }

  async createUser(telegramId: string, username: string) {
    logger.info('Creating new user', { telegramId, username })
    try {
      const response = await this.httpClient.post('/users', {
        telegramId,
        username,
      })
      logger.info('Successfully created user', { telegramId })
      return response.data
    } catch (error) {
      logger.error('Failed to create user', { telegramId, error })
      throw error
    }
  }

  //FIXME remove this method and resolve the user id in server side
  async getUserByTelegramId(telegramId: string) {
    logger.info('Fetching user', { telegramId })
    try {
      const response = await this.httpClient.get(`/users/${telegramId}`)
      logger.info('Successfully fetched user', { telegramId })
      return response.data
    } catch (error) {
      logger.error('Failed to fetch user', { telegramId, error })
      throw error
    }
  }

  async createExpense(expenseData: {
    userId: string
    amount: number
    merchant: string
    date: Date
    source: ExpenseSource
    currency: ExpenseCurrency
    installmentsTotal?: number
  }) {
    logger.info('Creating new expense', {
      userId: expenseData.userId,
      amount: expenseData.amount,
      merchant: expenseData.merchant,
    })
    try {
      const response = await this.httpClient.post('/expenses', expenseData)
      logger.info('Successfully created expense', {
        userId: expenseData.userId,
        amount: expenseData.amount,
      })
      return response.data
    } catch (error) {
      logger.error('Failed to create expense', {
        userId: expenseData.userId,
        error,
      })
      throw error
    }
  }

  async getExpensesByMonth(userId: string, year: number, month: number) {
    logger.info('Fetching expenses by month', { userId, year, month })
    try {
      const response = await this.httpClient.get(`/expenses/${userId}/${year}/${month}`)
      logger.info('Successfully fetched expenses', { userId, year, month })
      return response.data
    } catch (error) {
      logger.error('Failed to fetch expenses', { userId, year, month, error })
      throw error
    }
  }

  async updateExpense(expenseId: string, updateData: { installmentsTotal: number }) {
    logger.info('Updating expense', { expenseId, installmentsTotal: updateData.installmentsTotal })
    try {
      const response = await this.httpClient.put(`/expenses/${expenseId}`, updateData)
      logger.info('Successfully updated expense', { expenseId })
      return response.data
    } catch (error) {
      logger.error('Failed to update expense', { expenseId, error })
      throw error
    }
  }

  async syncEmails(userId: string) {
    logger.info('Syncing emails', { userId })
    try {
      const response = await this.httpClient.post(`/users/${userId}/sync-emails`)
      logger.info('Successfully synced emails', { userId })
      return response.data
    } catch (error) {
      logger.error('Failed to sync emails', { userId, error })
      throw error
    }
  }
}
