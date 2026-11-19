import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { hashingKey } from '../src/common/hashing/hash-bcrypt';
import { ProjectKind, ProjectStatus } from '../src/generated/prisma/enums';
import { Role } from '../src/generated/prisma/enums';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(60000);

const TEST_USER_PASSWORD = 'E2eContrib123';
const RUN = randomUUID().slice(0, 8);

interface AuthResponse {
  accessToken: string;
  user: { id: string; role: string };
}

interface ContributionResponse {
  id: string;
  projectId: string;
  sponsorId: string;
  amount: string;
  processingFee: string;
  status: string;
  createdAt: string;
}

interface ContributionListResponse {
  data: ContributionResponse[];
  meta: { total: number; page: number; limit: number };
  totalAmount?: string;
}

interface PreviewResponse {
  amount: string;
  fee: string;
  total: string;
}

interface ProjectSnapshot {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  kind: ProjectKind;
  goalAmount: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

function bodyOf<T>(response: { body: unknown }): T {
  return response.body as T;
}

describe('Contributions (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let prisma: PrismaService | undefined;
  let sponsorToken: string;
  let sponsorId: string;
  let sponsorEmail: string;
  let anaId: string;
  let anaToken: string;
  let activeProjectId: string;
  let hiddenProjectId: string;
  let initialActiveProject: ProjectSnapshot;

  const userIds: string[] = [];
  const sponsorIds: string[] = [];
  const projectIds: string[] = [];
  const contributionIds: string[] = [];
  const api = () => {
    if (!app) throw new Error('The e2e application is not initialized');
    return request(app.getHttpServer());
  };
  const database = () => {
    if (!prisma) throw new Error('Prisma is not initialized');
    return prisma;
  };
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signIn(email: string): Promise<AuthResponse> {
    const response = await api()
      .post('/auth/signin')
      .send({ email, password: TEST_USER_PASSWORD })
      .expect(200);

    return bodyOf<AuthResponse>(response);
  }

  async function projectSnapshot(id: string): Promise<ProjectSnapshot> {
    const project = await database().project.findUniqueOrThrow({
      where: { id },
    });

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      repoUrl: project.repoUrl,
      kind: project.kind,
      goalAmount: project.goalAmount.toString(),
      status: project.status,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const passwordHash = await hashingKey(TEST_USER_PASSWORD);
    sponsorEmail = `e2e-sponsor-${RUN}@plataforma.test`;
    const sponsorUser = await database().user.create({
      data: {
        name: `E2E Sponsor ${RUN}`,
        email: sponsorEmail,
        password: passwordHash,
        role: Role.sponsor,
        companyName: 'E2E Sponsor Company',
      },
      select: { id: true },
    });
    sponsorId = sponsorUser.id;
    sponsorIds.push(sponsorUser.id);
    userIds.push(sponsorUser.id);

    const anaEmail = `e2e-user-${RUN}@plataforma.test`;
    const anaUser = await database().user.create({
      data: {
        name: `E2E User ${RUN}`,
        email: anaEmail,
        password: passwordHash,
        role: Role.user,
      },
      select: { id: true },
    });
    anaId = anaUser.id;
    userIds.push(anaUser.id);

    const sponsor = await signIn(sponsorEmail);
    const ana = await signIn(anaEmail);
    sponsorToken = sponsor.accessToken;
    anaToken = ana.accessToken;

    const activeProject = await database().project.create({
      data: {
        title: `Contributions e2e active ${RUN}`,
        description: 'Active project created by the contributions e2e test.',
        repoUrl: `https://github.com/e2e/contributions-active-${RUN}`,
        kind: ProjectKind.app,
        goalAmount: '1000.00',
        status: ProjectStatus.active,
        ownerId: anaId,
      },
    });
    activeProjectId = activeProject.id;
    projectIds.push(activeProject.id);

    const hiddenProject = await database().project.create({
      data: {
        title: `Contributions e2e hidden ${RUN}`,
        description: 'Hidden project created by the contributions e2e test.',
        repoUrl: `https://github.com/e2e/contributions-hidden-${RUN}`,
        kind: ProjectKind.app,
        goalAmount: '1000.00',
        status: ProjectStatus.hidden,
        ownerId: anaId,
      },
    });
    hiddenProjectId = hiddenProject.id;
    projectIds.push(hiddenProject.id);

    initialActiveProject = await projectSnapshot(activeProjectId);
  });

  afterAll(async () => {
    if (prisma) {
      if (projectIds.length > 0) {
        await prisma.contribution.deleteMany({
          where: { projectId: { in: projectIds } },
        });
      }
      if (sponsorIds.length > 0) {
        await prisma.contribution.deleteMany({
          where: { sponsorId: { in: sponsorIds } },
        });
      }
      if (projectIds.length > 0) {
        await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
      }
      if (userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
    }
    await app?.close();
  });

  it('401: contributing without a token', async () => {
    await api()
      .post(`/projects/${activeProjectId}/contributions`)
      .send({ amount: '125.50' })
      .expect(401);
  });

  it('403: a user account cannot contribute', async () => {
    await api()
      .post(`/projects/${activeProjectId}/contributions`)
      .set(bearer(anaToken))
      .send({ amount: '125.50' })
      .expect(403);
  });

  it('400: rejects invalid amounts', async () => {
    const invalidAmounts: Array<{ label: string; amount: string | number }> = [
      { label: 'below minimum', amount: '0.99' },
      { label: 'comma decimal', amount: '1,5' },
      { label: 'number instead of text', amount: 125.5 },
    ];

    for (const { amount } of invalidAmounts) {
      await api()
        .post(`/projects/${activeProjectId}/contributions`)
        .set(bearer(sponsorToken))
        .send({ amount })
        .expect(400);
    }
  });

  it('400: rejects sponsorId from the request body', async () => {
    await api()
      .post(`/projects/${activeProjectId}/contributions`)
      .set(bearer(sponsorToken))
      .send({ amount: '125.50', sponsorId: anaId })
      .expect(400);
  });

  it('404: the target project does not exist or is hidden', async () => {
    await api()
      .post(`/projects/${randomUUID()}/contributions`)
      .set(bearer(sponsorToken))
      .send({ amount: '125.50' })
      .expect(404);

    await api()
      .post(`/projects/${hiddenProjectId}/contributions`)
      .set(bearer(sponsorToken))
      .send({ amount: '125.50' })
      .expect(404);

    await api().get(`/projects/${hiddenProjectId}/contributions`).expect(404);
  });

  it('200: public project list starts with totalAmount 0.00', async () => {
    const response = await api()
      .get(`/projects/${activeProjectId}/contributions`)
      .expect(200);
    const body = bodyOf<ContributionListResponse>(response);

    expect(body.data).toEqual([]);
    expect(body.meta).toMatchObject({ total: 0, page: 1, limit: 20 });
    expect(body.totalAmount).toBe('0.00');
    expect(body.meta).not.toHaveProperty('totalAmount');
  });

  it('201: creates contributions with the sponsor from the token', async () => {
    const firstResponse = await api()
      .post(`/projects/${activeProjectId}/contributions`)
      .set(bearer(sponsorToken))
      .send({ amount: '125.50' })
      .expect(201);
    const first = bodyOf<ContributionResponse>(firstResponse);
    contributionIds.push(first.id);

    expect(first.sponsorId).toBe(sponsorId);
    expect(first.amount).toBe('125.50');
    expect(first.processingFee).toBe('6.28');
    expect(first.status).toBe('simulated');

    const secondResponse = await api()
      .post(`/projects/${activeProjectId}/contributions`)
      .set(bearer(sponsorToken))
      .send({ amount: '10.00' })
      .expect(201);
    const second = bodyOf<ContributionResponse>(secondResponse);
    contributionIds.push(second.id);

    expect(second.sponsorId).toBe(sponsorId);
    expect(second.amount).toBe('10.00');
    expect(second.processingFee).toBe('0.50');
  });

  it('200: public list exposes totalAmount at the top level', async () => {
    const response = await api()
      .get(`/projects/${activeProjectId}/contributions`)
      .expect(200);
    const body = bodyOf<ContributionListResponse>(response);

    expect(body.meta).toMatchObject({ total: 2, page: 1, limit: 20 });
    expect(body.totalAmount).toBe('135.50');
    expect(body.meta).not.toHaveProperty('totalAmount');
  });

  it('200: /me/contributions only includes the authenticated sponsor', async () => {
    const otherContribution = await database().contribution.create({
      data: {
        projectId: hiddenProjectId,
        sponsorId: anaId,
        amount: '7.00',
        processingFee: '0.35',
      },
    });

    const response = await api()
      .get('/me/contributions')
      .query({ limit: 100 })
      .set(bearer(sponsorToken))
      .expect(200);
    const body = bodyOf<ContributionListResponse>(response);
    const ids = body.data.map((contribution) => contribution.id);

    expect(ids).toEqual(expect.arrayContaining(contributionIds));
    expect(ids).not.toContain(otherContribution.id);
    expect(
      body.data.every((contribution) => contribution.sponsorId === sponsorId),
    ).toBe(true);
  });

  it('401: preview requires a session', async () => {
    await api()
      .get('/contributions/preview')
      .query({ amount: '125.50' })
      .expect(401);
  });

  it('200: preview returns the expected breakdown', async () => {
    const response = await api()
      .get('/contributions/preview')
      .query({ amount: '125.50' })
      .set(bearer(sponsorToken))
      .expect(200);
    const body = bodyOf<PreviewResponse>(response);

    expect(body).toEqual({ amount: '125.50', fee: '6.28', total: '131.78' });
  });

  it('leaves the active project unchanged after contributions', async () => {
    expect(await projectSnapshot(activeProjectId)).toEqual(
      initialActiveProject,
    );
  });
});
