import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import * as request from 'supertest'
import { AppModule } from '@jnscas/cy/src/application/app.module'
import { ExpenseCurrency, ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/expense.types'

describe('ExpensesController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = testingModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    )
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /expenses', () => {
    const validExpense = {
      userId: 'test-user-123',
      amount: 100.5,
      merchant: 'Test Store',
      date: new Date().toISOString(),
      type: ExpenseType.MANUAL,
      source: ExpenseSource.WEB,
      currency: ExpenseCurrency.USD,
    }

    it('should create an expense with valid data', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .send(validExpense)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id')
          expect(res.body.userId).toBe(validExpense.userId)
          expect(res.body.amount).toBe(validExpense.amount)
          expect(res.body.merchant).toBe(validExpense.merchant)
          expect(res.body.type).toBe(validExpense.type)
          expect(res.body.source).toBe(validExpense.source)
          expect(res.body.currency).toBe(validExpense.currency)
        })
    })

    it('should fail with missing required fields', () => {
      const invalidExpense = { ...validExpense }
      delete invalidExpense.amount

      return request(app.getHttpServer())
        .post('/expenses')
        .send(invalidExpense)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['amount must be a number conforming to the specified constraints']),
          )
        })
    })

    it('should fail with invalid enum values', () => {
      const invalidExpense = {
        ...validExpense,
        type: 'INVALID_TYPE',
        source: 'INVALID_SOURCE',
        currency: 'INVALID_CURRENCY',
      }

      return request(app.getHttpServer())
        .post('/expenses')
        .send(invalidExpense)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'source must be one of the following values: gmail, website, telegram',
              'currency must be one of the following values: ARS, USD',
            ]),
          )
        })
    })

    it('should fail with invalid date format', () => {
      const invalidExpense = {
        ...validExpense,
        date: 'invalid-date',
      }

      return request(app.getHttpServer())
        .post('/expenses')
        .send(invalidExpense)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(expect.arrayContaining(['date must be a valid ISO 8601 date string']))
        })
    })
  })

  describe('GET /expenses/:userId/:year/:month', () => {
    it('should return expenses for a given user and month', () => {
      const userId = 'test-user-123'
      const year = 2024
      const month = 3

      return request(app.getHttpServer())
        .get(`/expenses/${userId}/${year}/${month}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
        })
    })

    it('should fail with invalid year or month', () => {
      const userId = 'test-user-123'
      const invalidYear = 'invalid-year'
      const invalidMonth = 'invalid-month'

      return request(app.getHttpServer())
        .get(`/expenses/${userId}/${invalidYear}/${invalidMonth}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining(['year must be a number string', 'month must be a number string']),
          )
        })
    })
  })
})
