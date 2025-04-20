import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@jnscas/cy/src/application/app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'

export async function initTestApp(): Promise<{ testingModule: TestingModule; app: NestFastifyApplication }> {
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = testingModule.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  await app.init()
  await app.getHttpAdapter().getInstance().ready()

  return { testingModule, app }
}
