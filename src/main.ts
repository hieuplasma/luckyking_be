import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //middleware
  // app.useGlobalGuards(new RolesGuard())
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(3001);
}
bootstrap();
