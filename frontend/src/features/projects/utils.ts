const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// "$ 150.000"
export function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}

// 0 to 100, for the progress bar. A goal of 0 has nothing to reach
export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

// Same rule as the back (utils/repo-url.ts): http(s), a real host and the repository path.
// "https://github.com/user/repo" is valid, "https://github.com" is not
export function isValidRepoUrl(value: string): boolean {
  if (value.length > 2048) return false;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.username || url.password) return false;
  if (!url.hostname.includes(".")) return false;

  return url.pathname.split("/").filter(Boolean).length >= 1;
}
