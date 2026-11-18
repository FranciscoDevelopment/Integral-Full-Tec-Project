import { isValidRepoUrl } from './repo-url';

describe('isValidRepoUrl', () => {
  it.each([
    'https://github.com/irinadandrea/warranty-api',
    'https://gitlab.com/group/subgroup/project',
    'https://bitbucket.org/team/repo',
    'https://codeberg.org/user/repo',
    'http://git.mi-empresa.com.ar/equipo/repo',
  ])('accepts %s', (url) => {
    expect(isValidRepoUrl(url)).toBe(true);
  });

  it.each([
    ['an empty string', ''],
    ['plain text', 'mi repo'],
    ['a host without the repository path', 'https://github.com'],
    [
      'a host without the repository path (trailing slash)',
      'https://github.com/',
    ],
    ['a protocol other than http(s)', 'ftp://github.com/user/repo'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a host without a dot', 'https://localhost/user/repo'],
    ['credentials inside the URL', 'https://user:pass@github.com/user/repo'],
    ['a value that is not a string', 42],
    ['a URL that is too long', `https://github.com/${'a'.repeat(2048)}`],
  ])('rejects %s', (_case, url) => {
    expect(isValidRepoUrl(url)).toBe(false);
  });
});
