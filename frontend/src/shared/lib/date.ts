import { formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";

// Fixed zone so server and browser render the same day (no hydration mismatch).
const DISPLAY_TIME_ZONE = "America/Argentina/Buenos_Aires";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeZone: DISPLAY_TIME_ZONE,
});

// "29 oct 2026"
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

// "hace 3 días". `now` is explicit: reading the clock inside a Server Component
// is rejected during prerender with Cache Components.
export function formatTimeAgo(isoDate: string, now: Date): string {
  return formatDistanceStrict(new Date(isoDate), now, {
    locale: es,
    addSuffix: true,
  });
}
