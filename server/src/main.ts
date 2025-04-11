import { NestFactory } from '@nestjs/core';
import { AppModule } from '@jnscas/cy/src/application/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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