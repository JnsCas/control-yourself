import { AppModule } from '@jnscas/cy/src/application/app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { AuthExceptionFilter } from '@jnscas/cy/src/infrastructure/filters/auth-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const configService = app.get(ConfigService)
  const host = configService.get('SERVER_HOST') || '0.0.0.0'
  const port = configService.get('SERVER_PORT') || 3000

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new AuthExceptionFilter())

  await app.listen({ host, port })
  console.log(`Server running on port ${port}`)
}
bootstrap()
