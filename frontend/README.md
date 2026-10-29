# Programadores Argentina — Frontend

Next.js replica of the Programadores Argentina community site. Part A of the MVP: no backend, data comes from JSON mocks (persisted in `localStorage` through Zustand in later challenges).

## Requirements

- Node.js 20.9 or newer (Next.js 16)
- npm

## Getting started

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Development server                   |
| `npm run build`     | Production build                     |
| `npm run start`     | Serves the production build          |
| `npm run lint`      | ESLint (flat config)                 |
| `npm run typecheck` | `tsc --noEmit`                       |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand 5 · React Hook Form + Zod 4 · date-fns 4 · lucide-react · sonner · clsx + tailwind-merge.

Cache Components and Partial Prefetching are enabled (see `next.config.ts`). Two consequences to keep in mind:

- Do not read the clock (`new Date()`, `Date.now()`) in a Server Component. Pass `now` in explicitly or use `"use cache"`.
- A Client Component that calls `usePathname()` or `useSearchParams()` must sit inside `<Suspense>`. The header nav already does.

## Structure (feature-first)

```
src/
  app/                  routes only: thin pages that compose features
  features/<feature>/   components/, hooks/, api.ts, store.ts, schema.ts, utils.ts, types.ts
  shared/
    components/ui/      Button, Input, Select, Card, Badge, EmptyState
    components/layout/  SiteHeader, SiteFooter, MainNav, PageContainer
    catalogs/           Spanish labels and options for every enum, skills, community links
    constants/          site name, tagline, contact email
    lib/                cn(), date helpers, delay()
    types/              enums and entity types shared with the API
  mocks/                users.json, news.json, jobs.json (+ typed exports in index.ts)
```

## Conventions

- Everything that is code is in English: folders, files, routes, identifiers, comments, branches and commits. Spanish is only for what the user sees (UI copy and mock content).
- Files and folders: `kebab-case`. Components, types and interfaces: `PascalCase`. Variables, functions and hooks: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Enum values: lowercase `snake_case` (`pending`, `tierra_del_fuego`).
- Enums live in `shared/types/enums.ts` as `as const` arrays plus a derived union type, so Zod can reuse them (`z.enum(SENIORITIES)`). Their Spanish labels live in `shared/catalogs`.
- Every list returns `{ data, meta: { total, page, limit } }` (`PaginatedResponse<T>`).
- A feature reads data only through its own `api.ts`, so swapping mocks for the real API never touches components.
- Commits follow Conventional Commits with the module as scope: `feat(news): add category filter`.

## Extension points for the other challenges

- `shared/components/providers.tsx`: app-wide client providers (D2 adds the session store rehydration here).
- `shared/components/layout/main-nav.tsx`: the "Ingresar a mi cuenta" button is a placeholder that D2 replaces with the session-aware menu.
- `features/home/components/latest-news-section.tsx`: D3 passes `<LatestNews limit={4} />` as `children`.
- `mocks/index.ts`: typed `MOCK_USERS`, `MOCK_NEWS`, `MOCK_JOBS`. D2 adds credentials to the user mocks.
