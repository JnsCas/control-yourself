import { initTestApp } from '@jnscas/cy/test/support/testApp'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

describe('HealthCheckController (e2e)', () => {
  let app: NestFastifyApplication

  beforeAll(async () => {
    app = (await initTestApp()).app
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', () => {
    return app
      .inject({
        method: 'GET',
        url: '/health-check',
      })
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body).toBe('OK')
      })
  })

  describe('Error Handling', () => {
    it('returns 404 for non-existent route', () => {
      return app
        .inject({
          method: 'GET',
          url: '/non-existent',
        })
        .then((res) => {
          expect(res.statusCode).toBe(404)
        })
    })
  })
})
