// Dates arrive as ISO strings. Slicing avoids timezone shifts when formatting.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatPeriod(
  startDate: string,
  endDate: string | null,
): string {
  return endDate
    ? `${formatDate(startDate)} al ${formatDate(endDate)}`
    : `Desde el ${formatDate(startDate)}`;
}