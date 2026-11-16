import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto, MAX_GOAL_AMOUNT } from './create-project.dto';
import { UpdateProjectDto } from './update-project.dto';

const validProject = {
  title: 'Juego de plataformas',
  description: 'Un juego 2D hecho con Godot para aprender a programar',
  repoUrl: 'https://github.com/irinadandrea/plataformas',
  kind: 'game',
  goalAmount: 150000,
};

// Same thing the global ValidationPipe does: plain JSON -> DTO instance -> validate
async function errorsFor(dtoClass: new () => object, body: object) {
  const errors = await validate(plainToInstance(dtoClass, body), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((error) => error.property);
}

describe('CreateProjectDto', () => {
  it('accepts a valid project', async () => {
    expect(await errorsFor(CreateProjectDto, validProject)).toEqual([]);
  });

  describe('goalAmount (meta)', () => {
    it.each([0, 1, 1500.5, 99.99, MAX_GOAL_AMOUNT])(
      'accepts %p',
      async (goalAmount) => {
        expect(
          await errorsFor(CreateProjectDto, { ...validProject, goalAmount }),
        ).toEqual([]);
      },
    );

    it.each([
      ['a negative number', -1],
      ['a negative decimal', -0.01],
      ['more than 2 decimals', 10.123],
      ['a value bigger than the column allows', MAX_GOAL_AMOUNT + 1],
      ['a string', '1500'],
      ['null', null],
    ])('rejects %s', async (_case, goalAmount) => {
      expect(
        await errorsFor(CreateProjectDto, { ...validProject, goalAmount }),
      ).toEqual(['goalAmount']);
    });

    it('is required', async () => {
      const withoutGoal: Partial<typeof validProject> = { ...validProject };
      delete withoutGoal.goalAmount;
      expect(await errorsFor(CreateProjectDto, withoutGoal)).toEqual([
        'goalAmount',
      ]);
    });
  });

  describe('repoUrl', () => {
    it.each([
      'github.com/user/repo',
      'https://github.com',
      'no es una url',
      'ftp://gitlab.com/user/repo',
    ])('rejects %p', async (repoUrl) => {
      expect(
        await errorsFor(CreateProjectDto, { ...validProject, repoUrl }),
      ).toEqual(['repoUrl']);
    });

    it('trims spaces before validating', async () => {
      expect(
        await errorsFor(CreateProjectDto, {
          ...validProject,
          repoUrl: '  https://gitlab.com/user/repo  ',
        }),
      ).toEqual([]);
    });
  });

  it('rejects a kind outside the enum', async () => {
    expect(
      await errorsFor(CreateProjectDto, { ...validProject, kind: 'website' }),
    ).toEqual(['kind']);
  });

  it('rejects ownerId in the body: it always comes from the token', async () => {
    expect(
      await errorsFor(CreateProjectDto, {
        ...validProject,
        ownerId: '7f1c2b4e-0000-4000-8000-000000000000',
      }),
    ).toEqual(['ownerId']);
  });
});

describe('UpdateProjectDto', () => {
  it('accepts a partial update', async () => {
    expect(
      await errorsFor(UpdateProjectDto, { title: 'Nuevo título' }),
    ).toEqual([]);
  });

  it('still validates the meta and the repository', async () => {
    expect(
      await errorsFor(UpdateProjectDto, { goalAmount: -5, repoUrl: 'x' }),
    ).toEqual(['repoUrl', 'goalAmount']);
  });

  it('lets the owner mark the project as completed', async () => {
    expect(await errorsFor(UpdateProjectDto, { status: 'completed' })).toEqual(
      [],
    );
  });

  it('does not let the owner hide the project (only the admin moderates)', async () => {
    expect(await errorsFor(UpdateProjectDto, { status: 'hidden' })).toEqual([
      'status',
    ]);
  });
});
