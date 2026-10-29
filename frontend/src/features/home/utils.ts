// 95300 -> "+95.300"
export function formatMemberCount(count: number): string {
  return `+${count.toLocaleString("es-AR", { useGrouping: "always" })}`;
}
