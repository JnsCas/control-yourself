import { AppModule } from '@jnscas/cy/src/application/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('SERVER_PORT') || 3000;
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap(); 