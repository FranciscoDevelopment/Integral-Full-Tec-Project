import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ProjectStatus, Role } from './../src/generated/prisma/enums';
import { PrismaService } from './../src/prisma/prisma.service';

// How Projects and Contributions talk to each other, from the API side:
// a sponsor contributes to a project, the project list of contributions adds up,
// a project that already received money cannot be deleted, and a hidden one is invisible.
// Needs the database of backend/.env (docker compose up) with the migrations applied.
// Every run creates its own users with a unique email and deletes everything at the end.

const PASSWORD = 'Aportes2026';
const RUN = randomUUID().slice(0, 8);

const newProject = {
  title: 'Proyecto para recibir aportes',
  description: 'Un proyecto de prueba para verificar los aportes de sponsors',
  repoUrl: 'https://github.com/demo/aportes',
  kind: 'tool',
  goalAmount: 1000,
};

interface ContributionBody {
  id: string;
  projectId: string;
  sponsorId: string;
  amount: string;
  processingFee: string;
  status: string;
  createdAt: string;
}

interface ContributionListBody {
  data: ContributionBody[];
  meta: { total: number; page: number; limit: number };
  totalAmount?: string;
}

describe('Projects and Contributions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let owner: string;
  let sponsorA: string;
  let sponsorB: string;

  let projectId: string;
  let emptyProjectId: string;
  let hiddenProjectId: string;

  const api = () => request(app.getHttpServer());
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signup(name: string, role: Role, extra: object = {}) {
    const res = await api()
      .post('/auth/signup')
      .send({
        name,
        email: `${name}-${RUN}@e2e.test`,
        password: PASSWORD,
        role,
        ...extra,
      })
      .expect(201);
    return (res.body as { accessToken: string }).accessToken;
  }

  async function createProject(title: string) {
    const res = await api()
      .post('/projects')
      .set(bearer(owner))
      .send({ ...newProject, title })
      .expect(201);
    return (res.body as { id: string }).id;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Same setup as main.ts
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

    owner = await signup('owner', Role.user);
    sponsorA = await signup('sponsor-a', Role.sponsor, {
      companyName: 'Empresa A',
    });
    sponsorB = await signup('sponsor-b', Role.sponsor, {
      companyName: 'Empresa B',
    });

    projectId = await createProject('Proyecto con aportes');
    emptyProjectId = await createProject('Proyecto sin aportes');
    hiddenProjectId = await createProject('Proyecto oculto');
    // Hidden by a moderator: straight to the database, the admin API is tested in projects.e2e-spec
    await prisma.project.update({
      where: { id: hiddenProjectId },
      data: { status: ProjectStatus.hidden },
    });
  });

  afterAll(async () => {
    const users = { email: { endsWith: `-${RUN}@e2e.test` } };
    // Contributions first: they restrict the deletion of projects and users
    await prisma.contribution.deleteMany({ where: { sponsor: users } });
    await prisma.project.deleteMany({ where: { owner: users } });
    await prisma.user.deleteMany({ where: users });
    await app.close();
  });

  describe('a sponsor contributes to a project', () => {
    it('401 without a token', () =>
      api()
        .post(`/projects/${projectId}/contributions`)
        .send({ amount: '10.00' })
        .expect(401));

    it('403 for the user role (only sponsors contribute)', () =>
      api()
        .post(`/projects/${projectId}/contributions`)
        .set(bearer(owner))
        .send({ amount: '10.00' })
        .expect(403));

    it('400 with an amount that is not valid', () =>
      api()
        .post(`/projects/${projectId}/contributions`)
        .set(bearer(sponsorA))
        .send({ amount: 'abc' })
        .expect(400));

    it('404 for a project that does not exist', () =>
      api()
        .post(`/projects/${randomUUID()}/contributions`)
        .set(bearer(sponsorA))
        .send({ amount: '10.00' })
        .expect(404));

    it('201 with the same fee that the preview announces', async () => {
      const preview = await api()
        .get('/contributions/preview')
        .query({ amount: '125.50' })
        .set(bearer(sponsorA))
        .expect(200);
      const { fee } = preview.body as { fee: string };

      const res = await api()
        .post(`/projects/${projectId}/contributions`)
        .set(bearer(sponsorA))
        .send({ amount: '125.50' })
        .expect(201);
      const body = res.body as ContributionBody;

      expect(body).toMatchObject({
        projectId,
        amount: '125.50',
        processingFee: fee,
        status: 'simulated',
      });
      expect(typeof body.sponsorId).toBe('string');
    });
  });

  describe('what the project screen reads', () => {
    it('a second sponsor adds to the total of the project', async () => {
      await api()
        .post(`/projects/${projectId}/contributions`)
        .set(bearer(sponsorB))
        .send({ amount: '74.50' })
        .expect(201);

      // Public: the detail of a project is visible without a session
      const res = await api()
        .get(`/projects/${projectId}/contributions`)
        .query({ page: 1, limit: 10 })
        .expect(200);
      const body = res.body as ContributionListBody;

      expect(body.meta).toMatchObject({ total: 2, page: 1, limit: 10 });
      expect(body.totalAmount).toBe('200.00');
      expect(body.data).toHaveLength(2);
    });

    it('the total of a project without contributions is zero', async () => {
      const res = await api()
        .get(`/projects/${emptyProjectId}/contributions`)
        .expect(200);
      const body = res.body as ContributionListBody;

      expect(body.data).toEqual([]);
      expect(body.totalAmount).toBe('0.00');
    });

    it('the total counts only that project', async () => {
      await api()
        .post(`/projects/${emptyProjectId}/contributions`)
        .set(bearer(sponsorA))
        .send({ amount: '10.00' })
        .expect(201);

      const res = await api()
        .get(`/projects/${projectId}/contributions`)
        .expect(200);
      expect((res.body as ContributionListBody).totalAmount).toBe('200.00');
    });
  });

  describe('my contributions (sponsor)', () => {
    it('lists only my own, newest first', async () => {
      const res = await api()
        .get('/me/contributions')
        .set(bearer(sponsorB))
        .expect(200);
      const body = res.body as ContributionListBody;

      expect(body.meta.total).toBe(1);
      expect(body.data[0]).toMatchObject({ projectId, amount: '74.50' });
      // The list of one person has no project total
      expect(body.totalAmount).toBeUndefined();
    });

    it('sponsor A sees the two projects they contributed to', async () => {
      const res = await api()
        .get('/me/contributions')
        .set(bearer(sponsorA))
        .expect(200);
      const body = res.body as ContributionListBody;

      expect(body.meta.total).toBe(2);
      expect(body.data.map((c) => c.projectId).sort()).toEqual(
        [projectId, emptyProjectId].sort(),
      );
    });

    it('401 without a token', () => api().get('/me/contributions').expect(401));

    it('403 for the user role', () =>
      api().get('/me/contributions').set(bearer(owner)).expect(403));
  });

  describe('deleting a project that received money', () => {
    it('409: it cannot be deleted, and the message says what to do', async () => {
      const res = await api()
        .delete(`/projects/${projectId}`)
        .set(bearer(owner))
        .expect(409);
      expect((res.body as { message: string }).message).toContain(
        'Mark it as completed instead',
      );

      // Nothing was lost: the project and its contributions are still there
      await api().get(`/projects/${projectId}`).expect(200);
      const list = await api()
        .get(`/projects/${projectId}/contributions`)
        .expect(200);
      expect((list.body as ContributionListBody).meta.total).toBe(2);
    });

    it('it can be marked as completed instead', async () => {
      await api()
        .patch(`/projects/${projectId}`)
        .set(bearer(owner))
        .send({ status: 'completed' })
        .expect(200);

      const res = await api().get(`/projects/${projectId}`).expect(200);
      expect((res.body as { status: string }).status).toBe('completed');
    });

    it('204: a project without contributions can still be deleted', async () => {
      const id = await createProject('Proyecto que se borra');
      await api().delete(`/projects/${id}`).set(bearer(owner)).expect(204);
      await api().get(`/projects/${id}`).expect(404);
    });
  });

  describe('a hidden project', () => {
    it('does not accept contributions (404, like the public detail)', () =>
      api()
        .post(`/projects/${hiddenProjectId}/contributions`)
        .set(bearer(sponsorA))
        .send({ amount: '10.00' })
        .expect(404));

    it('does not show its contributions either', () =>
      api().get(`/projects/${hiddenProjectId}/contributions`).expect(404));
  });
});
