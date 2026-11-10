import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.use(helmet());

  app.use(cookieParser());

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),

    methods: ['GET', 'POST', 'PATCH', 'DELETE'],

    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Docker sends SIGTERM on stop: without this Prisma never closes its connection
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
