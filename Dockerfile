# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
# --ignore-scripts: иначе npm ci запускает prepare («prisma generate && nuxt prepare») до COPY . .
# и падает на шаге 5/9 с «Could not find Prisma Schema».
RUN npm ci --ignore-scripts

# Один слой исходников — prisma/schema.prisma обязан попасть в контекст (см. .dockerignore).
COPY . .
RUN test -f prisma/schema.prisma || (echo "FATAL: prisma/schema.prisma отсутствует в контексте сборки. Запускайте build из корня gogol_tasks." && ls -la && ls -la prisma 2>/dev/null; exit 1)

ARG NUXT_PUBLIC_APP_BASEURL=/dashboard/
ENV NUXT_PUBLIC_APP_BASEURL=$NUXT_PUBLIC_APP_BASEURL

ENV DATABASE_URL="file:./build-placeholder.db"
RUN ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma
# То, что в package.json в prepare после prisma (нужно для nuxt build)
RUN npx nuxt prepare
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl sqlite

ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Явно копируем схему отдельной инструкцией (надёжнее пустой папки prisma в кэше).
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && test -f /app/prisma/schema.prisma \
  && test -f /app/node_modules/.bin/prisma

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
