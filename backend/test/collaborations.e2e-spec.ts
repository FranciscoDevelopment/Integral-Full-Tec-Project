import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ProjectKind } from '../src/generated/prisma/enums';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(60000);

const PASSWORD = 'Test1234!';
const MISSING_PROJECT_ID = '00000000-0000-4000-8000-000000000000';
const VALID_BODY = {
  role: 'UI design',
  description: 'Puedo ayudar con la interfaz',
  startDate: '2026-11-20',
};

describe('Collaborations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let projectId: string;
  let collaborationId: string;
  let collaboratorUserId: string;
  const userIds: string[] = [];
  const tokens = { owner: '', collaborator: '', other: '' };

  const http = () => request(app.getHttpServer());
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function signUp(name: string, email: string) {
    const res = await http()
      .post('/auth/signup')
      .send({ name, email, password: PASSWORD });
    expect(res.status).toBeLessThan(300);
    userIds.push(res.body.user.id);
    return res.body as { user: { id: string }; accessToken: string };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const stamp = Date.now();
    const owner = await signUp('Dueno E2E', `e2e-owner-${stamp}@test.com`);
    const collaborator = await signUp(
      'Colab E2E',
      `e2e-colab-${stamp}@test.com`,
    );
    const other = await signUp('Otro E2E', `e2e-other-${stamp}@test.com`);
    tokens.owner = owner.accessToken;
    tokens.collaborator = collaborator.accessToken;
    tokens.other = other.accessToken;
    collaboratorUserId = collaborator.user.id;

    const project = await prisma.project.create({
      data: {
        title: 'Proyecto e2e',
        description: 'Proyecto creado por el test e2e',
        repoUrl: 'https://github.com/test/e2e',
        kind: ProjectKind.app,
        goalAmount: 100,
        ownerId: owner.user.id,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    if (projectId) {
      await prisma.collaboration.deleteMany({ where: { projectId } });
      await prisma.project.delete({ where: { id: projectId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('401: applying without a token', async () => {
    await http()
      .post(`/projects/${projectId}/collaborations`)
      .send(VALID_BODY)
      .expect(401);
  });

  it('403: the owner cannot collaborate on their own project', async () => {
    await http()
      .post(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.owner))
      .send(VALID_BODY)
      .expect(403);
  });

  it('404: the project does not exist', async () => {
    await http()
      .post(`/projects/${MISSING_PROJECT_ID}/collaborations`)
      .set(bearer(tokens.collaborator))
      .send(VALID_BODY)
      .expect(404);
  });

  it('400: collaboratorId in the body is rejected', async () => {
    await http()
      .post(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.collaborator))
      .send({ ...VALID_BODY, collaboratorId: 'someone-else' })
      .expect(400);
  });

  it('201: a collaborator applies and it starts as pending', async () => {
    const res = await http()
      .post(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.collaborator))
      .send(VALID_BODY)
      .expect(201);
    expect(res.body.status).toBe('pending');
    collaborationId = res.body.id;
  });

  it('409: a duplicate active application', async () => {
    await http()
      .post(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.collaborator))
      .send(VALID_BODY)
      .expect(409);
  });

  it('403: someone who is not the owner cannot change the status', async () => {
    const url = `/collaborations/${collaborationId}/status`;
    await http()
      .patch(url)
      .set(bearer(tokens.collaborator))
      .send({ status: 'accepted' })
      .expect(403);
    await http()
      .patch(url)
      .set(bearer(tokens.other))
      .send({ status: 'accepted' })
      .expect(403);
  });

  it('403: only the owner can list the requests of a project', async () => {
    await http()
      .get(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.other))
      .expect(403);
  });

  it('409: pending cannot jump to confirmed', async () => {
    await http()
      .patch(`/collaborations/${collaborationId}/status`)
      .set(bearer(tokens.owner))
      .send({ status: 'confirmed' })
      .expect(409);
  });

  it('200: the owner accepts and then confirms', async () => {
    const url = `/collaborations/${collaborationId}/status`;
    const accepted = await http()
      .patch(url)
      .set(bearer(tokens.owner))
      .send({ status: 'accepted' })
      .expect(200);
    expect(accepted.body.status).toBe('accepted');
    const confirmed = await http()
      .patch(url)
      .set(bearer(tokens.owner))
      .send({ status: 'confirmed' })
      .expect(200);
    expect(confirmed.body.status).toBe('confirmed');
  });

  it('200: the public profile endpoint shows the confirmed collaboration', async () => {
    const res = await http()
      .get(`/users/${collaboratorUserId}/collaborations/confirmed`)
      .expect(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].project.title).toBe('Proyecto e2e');
  });

  it('409 / 403 / 204: withdrawing requests', async () => {
    await http()
      .delete(`/collaborations/${collaborationId}`)
      .set(bearer(tokens.collaborator))
      .expect(409);

    const pending = await http()
      .post(`/projects/${projectId}/collaborations`)
      .set(bearer(tokens.other))
      .send(VALID_BODY)
      .expect(201);

    await http()
      .delete(`/collaborations/${pending.body.id}`)
      .set(bearer(tokens.collaborator))
      .expect(403);
    await http()
      .delete(`/collaborations/${pending.body.id}`)
      .set(bearer(tokens.other))
      .expect(204);
  });
});
