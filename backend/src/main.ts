import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);

  // Behind a reverse proxy (Render, Railway, Nginx...) every request arrives from the proxy IP, so
  // the rate limit would count all the users as one. TRUST_PROXY = how many proxies sit in front of
  // the API. Only a number is accepted: "true" would let anyone fake their IP with X-Forwarded-For
  const trustProxy = Number(config.get<string>('TRUST_PROXY', '0'));

  if (Number.isInteger(trustProxy) && trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  }

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
