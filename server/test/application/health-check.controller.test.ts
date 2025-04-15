import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '@jnscas/cy/src/application/app.module'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { NestFastifyApplication } from '@nestjs/platform-fastify'

describe('HealthCheckController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
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

  afterEach(async () => {
    await app.close()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/health-check').expect(200).expect('OK')
  })

  describe('Error Handling', () => {
    it('returns 404 for non-existent route', () => {
      return request(app.getHttpServer()).get('/non-existent').expect(404)
    })
  })
})
