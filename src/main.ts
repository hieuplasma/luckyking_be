// process.env.TZ = 'Asia/Bangkok'; // Replace 'Asia/Bangkok' with your desired timezone value

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './app.exception.filter';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  });

  //middleware
  // app.useGlobalGuards(new RolesGuard())
  app.useGlobalFilters(new HttpExceptionFilter(new LoggerService()));
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors()
  await app.listen(3001);
}
bootstrap();
