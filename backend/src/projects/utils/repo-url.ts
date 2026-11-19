// Pure function (no Nest, no Prisma) so it can be unit tested on its own.
// A repository URL must be http(s), have a real host (with a dot) and at least
// one path segment: "https://github.com/user/repo" is valid, "https://github.com" is not.
// Any host is accepted (GitHub, GitLab, Bitbucket, Codeberg, a self-hosted Gitea...).
export function isValidRepoUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2048) return false;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  if (url.username || url.password) return false;
  if (!url.hostname.includes('.')) return false;

  const segments = url.pathname.split('/').filter(Boolean);
  return segments.length >= 1;
}
