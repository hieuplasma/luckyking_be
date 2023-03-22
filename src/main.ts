// process.env.TZ = 'Asia/Bangkok'; // Replace 'Asia/Bangkok' with your desired timezone value

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //middleware
  // app.useGlobalGuards(new RolesGuard())
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(3001);
}
bootstrap();
