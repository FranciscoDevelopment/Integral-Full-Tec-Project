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

# generate no se conecta a la base, pero prisma.config.ts exige que la variable exista
# (el if deja construir la imagen antes de que exista prisma/schema.prisma)
RUN if [ -f prisma/schema.prisma ]; then \
      DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm prisma generate; \
    fi

RUN pnpm run build

# nest build solo compila TypeScript: el motor nativo de Prisma se copia junto al cliente compilado
RUN if [ -d src/generated ]; then \
      find src/generated -name '*.node' -exec cp {} dist/generated/prisma/ \; ; \
    fi


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
