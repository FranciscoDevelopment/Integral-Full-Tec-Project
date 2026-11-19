export function getSafeCallbackUrl(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    /[a-z][a-z\d+.-]*:/i.test(value)
  ) {
    return "/";
  }

  try {
    const pathname = new URL(value, "http://localhost").pathname.replace(
      /\/+$/,
      "",
    );
    if (pathname === "/login" || pathname === "/register") {
      return "/";
    }
  } catch {
    return "/";
  }

  return value;
}
