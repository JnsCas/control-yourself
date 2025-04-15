import { ExpenseCurrency, ExpenseSource, ExpenseType } from '@jnscas/cy/src/domain/expenses/expense.types'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { initTestApp } from '@jnscas/cy/test/support/testApp'

describe('ExpensesController (e2e)', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = (await initTestApp()).app
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
      return app.inject({
        method: 'POST',
        url: '/expenses',
        body: validExpense,
      })
        .then((res) => {
          expect(res.statusCode).toBe(201)
          const payload = JSON.parse(res.payload)
          expect(payload).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              userId: validExpense.userId,
              amount: validExpense.amount,
              merchant: validExpense.merchant,
              type: validExpense.type,
              source: validExpense.source,
              currency: validExpense.currency,
            }),
          )
        })
    })

    it('should fail with missing required fields', () => {
      const invalidExpense = { ...validExpense }
      delete invalidExpense.amount

        return app.inject({
        method: 'POST',
        url: '/expenses',
        body: invalidExpense,
      })
        .then((res) => {
          expect(res.statusCode).toBe(400)
          const payload = JSON.parse(res.payload)
          expect(payload).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining(['amount must be a number conforming to the specified constraints']),
              statusCode: 400,
              error: 'Bad Request',
            }),
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

      return app.inject({
        method: 'POST',
        url: '/expenses',
        body: invalidExpense,
      })
        .then((res) => {
          expect(res.statusCode).toBe(400)
          const payload = JSON.parse(res.payload)
          expect(payload).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining([
                'source must be one of the following values: gmail, website, telegram',
                'currency must be one of the following values: ARS, USD',
              ]),
              statusCode: 400,
              error: 'Bad Request',
            }),
          )
        })
    })

    it('should fail with invalid date format', () => {
      const invalidExpense = {
        ...validExpense,
        date: 'invalid-date',
      }

      return app.inject({
        method: 'POST',
        url: '/expenses',
        body: invalidExpense,
      })
        .then((res) => {
          expect(res.statusCode).toBe(400)
          const payload = JSON.parse(res.payload)
          expect(payload).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining(['date must be a valid ISO 8601 date string']),
              statusCode: 400,
              error: 'Bad Request',
            }),
          )
        })
    })
  })

  describe('GET /expenses/:userId/:year/:month', () => {
    it('should return expenses for a given user and month', () => {
      const userId = 'test-user-123'
      const year = 2024
      const month = 3

      return app.inject({
        method: 'GET',
        url: `/expenses/${userId}/${year}/${month}`,
      }).then((res) => {
        expect(res.statusCode).toBe(200)
        const payload = JSON.parse(res.payload)
        expect(Array.isArray(payload)).toBe(true)
      })
    })

    it('should fail with invalid year or month', () => {
      const userId = 'test-user-123'
      const invalidYear = 'invalid-year'
      const invalidMonth = 'invalid-month'

      return app.inject({
        method: 'GET',
        url: `/expenses/${userId}/${invalidYear}/${invalidMonth}`,
      }).then((res) => {
        expect(res.statusCode).toBe(400)
        const payload = JSON.parse(res.payload)
        expect(payload).toEqual(
          expect.objectContaining({
            message: expect.arrayContaining(['year must be a number string', 'month must be a number string']),
            statusCode: 400,
            error: 'Bad Request',
          }),
        )
      })
    })
  })
})
