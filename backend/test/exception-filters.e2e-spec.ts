import {
  BadRequestException,
  Controller,
  Get,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { ErrorResponseT } from '../src/common/filters/error-response';
import { GLOBAL_EXCEPTION_FILTERS } from '../src/common/filters/global-filters';
import { Prisma } from '../src/generated/prisma/client';

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError(
    'Invalid `prisma.user.create()` invocation: Unique constraint failed on the fields: (`email`)',
    { code, clientVersion: 'test', meta: { target: ['email'] } },
  );
}

// Every route fails on purpose. This test only needs the filters, so there is no AppModule and no database
@Controller('boom')
class BoomController {
  @Get('not-found')
  notFound() {
    throw new NotFoundException('Nothing here');
  }

  @Get('validation')
  validation() {
    throw new BadRequestException([
      'name must be a string',
      'age must be a number',
    ]);
  }

  @Get('unique')
  unique() {
    throw prismaError('P2002');
  }

  @Get('foreign-key')
  foreignKey() {
    throw prismaError('P2003');
  }

  @Get('missing')
  missing() {
    throw prismaError('P2025');
  }

  @Get('prisma-unknown')
  prismaUnknown() {
    throw prismaError('P2034');
  }

  @Get('crash')
  crash() {
    throw new Error('connect ECONNREFUSED 10.0.0.5:5432 (secret-db-host)');
  }
}

describe('Exception filters (e2e)', () => {
  let app: INestApplication<App>;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BoomController],
      providers: [...GLOBAL_EXCEPTION_FILTERS],
    }).compile();
    app = moduleRef.createNestApplication();
    // The filters log on purpose: keep the test output clean
    app.useLogger(false);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HttpException', () => {
    it('keeps the status and the message, with the same shape Nest uses', async () => {
      const res = await http().get('/boom/not-found').expect(404);
      expect(res.body).toMatchObject({
        statusCode: 404,
        message: 'Nothing here',
        error: 'Not Found',
        path: '/boom/not-found',
      });
      expect(typeof (res.body as ErrorResponseT).timestamp).toBe('string');
    });

    it('keeps message as an array (the front reads string | string[])', async () => {
      const res = await http().get('/boom/validation').expect(400);
      expect((res.body as ErrorResponseT).message).toEqual([
        'name must be a string',
        'age must be a number',
      ]);
    });

    it('also answers JSON for a route that does not exist', async () => {
      const res = await http().get('/nope').expect(404);
      expect(res.body).toMatchObject({ statusCode: 404, error: 'Not Found' });
    });
  });

  describe('Prisma errors', () => {
    it('P2002 (unique) is a 409, not a 500', async () => {
      const res = await http().get('/boom/unique').expect(409);
      expect(res.body).toMatchObject({ statusCode: 409, error: 'Conflict' });
    });

    it('P2003 (foreign key) is a 409', async () => {
      await http().get('/boom/foreign-key').expect(409);
    });

    it('P2025 (record not found) is a 404', async () => {
      const res = await http().get('/boom/missing').expect(404);
      expect((res.body as ErrorResponseT).error).toBe('Not Found');
    });

    it('does not leak the column, the table or the Prisma message', async () => {
      const res = await http().get('/boom/unique').expect(409);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain('email');
      expect(body).not.toContain('prisma.user');
    });

    it('a Prisma code we do not know is a generic 500', async () => {
      const res = await http().get('/boom/prisma-unknown').expect(500);
      expect(res.body).toMatchObject({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
      expect(JSON.stringify(res.body)).not.toContain('P2034');
    });
  });

  describe('Unexpected errors', () => {
    it('answers a generic 500 with no stack trace and no internals', async () => {
      const res = await http().get('/boom/crash').expect(500);
      expect(res.body).toMatchObject({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
      expect(res.body).not.toHaveProperty('stack');

      const body = JSON.stringify(res.body);
      expect(body).not.toContain('ECONNREFUSED');
      expect(body).not.toContain('secret-db-host');
      expect(body).not.toMatch(/\.ts:\d+/);
    });
  });
});
