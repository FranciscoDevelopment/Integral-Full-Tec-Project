# syntax=docker/dockerfile:1

# ── base: Corepack + manifiestos ─────────────────────────────────
FROM node:24-alpine AS base

ENV npm_config_store_dir=/pnpm/store

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./


# ── prod-deps: solo dependencias de producción ───────────────────
FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile


# ── build: todo + generar el cliente de Prisma + compilar ────────
FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

# generate never connects to the DB, but prisma.config.ts requires the variable to exist
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm prisma generate

RUN pnpm run build

# nest build only compiles TypeScript: copy Prisma's native engine next to the compiled client
RUN find src/generated -name '*.node' -exec cp {} dist/generated/prisma/ \;


# ── runtime: solo lo necesario para ejecutar ─────────────────────
FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["node", "-e", "require('http').get('http://127.0.0.1:' + process.env.PORT + '/health', (res) => process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1)).on('error', () => process.exit(1))"]

CMD ["node", "dist/main.js"]
