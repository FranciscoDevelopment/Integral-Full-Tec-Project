import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { hashingKey } from './../src/common/hashing/hash-bcrypt';
import { Role } from './../src/generated/prisma/enums';
import { PrismaService } from './../src/prisma/prisma.service';

// Needs the database of backend/.env (docker compose up) with the migrations applied.
// Every run creates its own users with a unique email and deletes them at the end.

const PASSWORD = 'Proyectos2026';
const RUN = randomUUID().slice(0, 8);

const newProject = {
  title: 'Juego de plataformas',
  description: 'Un juego 2D hecho con Godot para aprender a programar',
  repoUrl: 'https://github.com/demo/plataformas',
  kind: 'game',
  goalAmount: 150000,
};

describe('Projects (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Bearer tokens of each actor (the API also accepts the httpOnly cookie)
  let owner: string;
  let other: string;
  let sponsor: string;
  let admin: string;

  let projectId: string;
  let hiddenProjectId: string;
  let hiddenOwnerId: string;

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
    other = await signup('other', Role.user);
    sponsor = await signup('sponsor', Role.sponsor, {
      companyName: 'Empresa Demo',
    });

    // An admin is never created through the API: straight to the database, like the seed does
    const adminEmail = `admin-${RUN}@e2e.test`;
    await prisma.user.create({
      data: {
        name: 'admin',
        email: adminEmail,
        password: await hashingKey(PASSWORD),
        role: Role.admin,
      },
    });
    const res = await api()
      .post('/auth/signin')
      .send({ email: adminEmail, password: PASSWORD })
      .expect(200);
    admin = (res.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    const users = { email: { endsWith: `-${RUN}@e2e.test` } };
    await prisma.project.deleteMany({ where: { owner: users } });
    await prisma.user.deleteMany({ where: users });
    await app.close();
  });

  describe('POST /projects', () => {
    it('401 without a token', () =>
      api().post('/projects').send(newProject).expect(401));

    it('401 with a forged token', () =>
      api()
        .post('/projects')
        .set(bearer('not.a.valid.token'))
        .send(newProject)
        .expect(401));

    it('403 for a sponsor (only the user role publishes)', () =>
      api()
        .post('/projects')
        .set(bearer(sponsor))
        .send(newProject)
        .expect(403));

    it('400 with a negative meta or an invalid repository URL', async () => {
      const res = await api()
        .post('/projects')
        .set(bearer(owner))
        .send({ ...newProject, goalAmount: -10, repoUrl: 'no-es-url' })
        .expect(400);
      const message = JSON.stringify(res.body);
      expect(message).toContain('goalAmount');
      expect(message).toContain('repoUrl');
    });

    it('201 and the owner comes from the token, not from the body', async () => {
      // ownerId in the body is rejected by the whitelist (400)...
      await api()
        .post('/projects')
        .set(bearer(owner))
        .send({ ...newProject, ownerId: randomUUID() })
        .expect(400);

      // ...and without it the project belongs to whoever is logged in
      const res = await api()
        .post('/projects')
        .set(bearer(owner))
        .send(newProject)
        .expect(201);

      const body = res.body as {
        id: string;
        goalAmount: number;
        owner: Record<string, unknown>;
      };
      projectId = body.id;
      expect(body.goalAmount).toBe(150000);
      expect(body.owner.name).toBe('owner');
      // The owner comes with public fields only (R7)
      expect(body.owner).not.toHaveProperty('email');
      expect(body.owner).not.toHaveProperty('password');
    });
  });

  describe('data isolation: someone else edits or deletes', () => {
    it('403 when another user edits the project (changing the ID in the URL)', () =>
      api()
        .patch(`/projects/${projectId}`)
        .set(bearer(other))
        .send({ title: 'Me lo quedo' })
        .expect(403));

    it('403 when another user deletes the project', () =>
      api().delete(`/projects/${projectId}`).set(bearer(other)).expect(403));

    it('403 for the admin too: moderation goes through /admin', () =>
      api()
        .patch(`/projects/${projectId}`)
        .set(bearer(admin))
        .send({ title: 'Editado por admin' })
        .expect(403));

    it('the project was not touched', async () => {
      const res = await api().get(`/projects/${projectId}`).expect(200);
      expect((res.body as { title: string }).title).toBe(newProject.title);
    });

    it('404 for a project that does not exist', () =>
      api()
        .patch(`/projects/${randomUUID()}`)
        .set(bearer(owner))
        .send({ title: 'Nada' })
        .expect(404));

    it('400 for an id that is not a uuid', () =>
      api().get('/projects/123').expect(400));
  });

  describe('owner', () => {
    it('200 when the owner edits and marks it as completed', async () => {
      const res = await api()
        .patch(`/projects/${projectId}`)
        .set(bearer(owner))
        .send({ title: 'Plataformas 2D', status: 'completed' })
        .expect(200);
      expect(res.body).toMatchObject({
        title: 'Plataformas 2D',
        status: 'completed',
      });
    });

    it('400 when the owner tries to hide it (only the admin moderates)', () =>
      api()
        .patch(`/projects/${projectId}`)
        .set(bearer(owner))
        .send({ status: 'hidden' })
        .expect(400));

    it('GET /me/projects lists only my projects', async () => {
      await api()
        .post('/projects')
        .set(bearer(other))
        .send({ ...newProject, title: 'Proyecto de otra persona' })
        .expect(201);

      const res = await api()
        .get('/me/projects')
        .set(bearer(owner))
        .expect(200);
      const body = res.body as {
        data: { id: string }[];
        meta: { total: number };
      };
      expect(body.meta.total).toBe(1);
      expect(body.data[0].id).toBe(projectId);
    });

    it('401 on /me/projects without a token', () =>
      api().get('/me/projects').expect(401));
  });

  describe('public list', () => {
    it('answers { data, meta } and filters by kind and text', async () => {
      const res = await api()
        .get('/projects')
        .query({ kind: 'game', q: 'otra persona', limit: 5 })
        .expect(200);
      const body = res.body as {
        data: { title: string }[];
        meta: { page: number; limit: number };
      };
      expect(body.meta).toMatchObject({ page: 1, limit: 5 });
      expect(body.data.map((p) => p.title)).toContain(
        'Proyecto de otra persona',
      );
    });

    it('400 when someone asks for hidden projects in the public list', () =>
      api().get('/projects').query({ status: 'hidden' }).expect(400));

    it('filters by owner: only that person projects', async () => {
      const detail = await api().get(`/projects/${projectId}`).expect(200);
      const ownerId = (detail.body as { ownerId: string }).ownerId;

      const res = await api()
        .get('/projects')
        .query({ ownerId, limit: 50 })
        .expect(200);
      const body = res.body as {
        data: { id: string; ownerId: string }[];
      };
      expect(body.data.map((p) => p.id)).toContain(projectId);
      expect(body.data.every((p) => p.ownerId === ownerId)).toBe(true);
    });

    it('400 when the owner filter is not a uuid', () =>
      api().get('/projects').query({ ownerId: 'not-a-uuid' }).expect(400));
  });

  describe('moderation (admin)', () => {
    beforeAll(async () => {
      const res = await api()
        .post('/projects')
        .set(bearer(other))
        .send({ ...newProject, title: 'Proyecto para moderar' })
        .expect(201);
      const created = res.body as { id: string; ownerId: string };
      hiddenProjectId = created.id;
      hiddenOwnerId = created.ownerId;
    });

    it('403 for a regular user', () =>
      api().get('/admin/projects').set(bearer(owner)).expect(403));

    it('403 for a user who tries to hide a project', () =>
      api()
        .patch(`/admin/projects/${hiddenProjectId}/visibility`)
        .set(bearer(owner))
        .send({ hidden: true })
        .expect(403));

    it('200 when the admin hides it', async () => {
      const res = await api()
        .patch(`/admin/projects/${hiddenProjectId}/visibility`)
        .set(bearer(admin))
        .send({ hidden: true })
        .expect(200);
      expect((res.body as { status: string }).status).toBe('hidden');
    });

    it('a hidden project is 404 in the public detail', () =>
      api().get(`/projects/${hiddenProjectId}`).expect(404));

    it('a hidden project does not appear in the public list', async () => {
      const res = await api()
        .get('/projects')
        .query({ q: 'Proyecto para moderar' })
        .expect(200);
      expect((res.body as { meta: { total: number } }).meta.total).toBe(0);
    });

    it('a hidden project stays out of the owner filter too', async () => {
      const res = await api()
        .get('/projects')
        .query({ ownerId: hiddenOwnerId, limit: 50 })
        .expect(200);
      const ids = (res.body as { data: { id: string }[] }).data.map(
        (p) => p.id,
      );
      expect(ids).not.toContain(hiddenProjectId);
    });

    it('404 (not 403) when someone else tries to edit a hidden project', () =>
      api()
        .patch(`/projects/${hiddenProjectId}`)
        .set(bearer(owner))
        .send({ title: 'Título válido' })
        .expect(404));

    it('its owner still sees it in /me/projects', async () => {
      const res = await api()
        .get('/me/projects')
        .query({ status: 'hidden' })
        .set(bearer(other))
        .expect(200);
      expect((res.body as { data: { id: string }[] }).data[0].id).toBe(
        hiddenProjectId,
      );
    });

    it('the admin sees it in /admin/projects', async () => {
      const res = await api()
        .get('/admin/projects')
        .query({ status: 'hidden', q: 'Proyecto para moderar' })
        .set(bearer(admin))
        .expect(200);
      expect((res.body as { meta: { total: number } }).meta.total).toBe(1);
    });

    it('200 when the admin shows it again', async () => {
      await api()
        .patch(`/admin/projects/${hiddenProjectId}/visibility`)
        .set(bearer(admin))
        .send({ hidden: false })
        .expect(200);
      await api().get(`/projects/${hiddenProjectId}`).expect(200);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('204 when the owner deletes it, and then it is gone', async () => {
      await api()
        .delete(`/projects/${projectId}`)
        .set(bearer(owner))
        .expect(204);
      await api().get(`/projects/${projectId}`).expect(404);
    });
  });
});
