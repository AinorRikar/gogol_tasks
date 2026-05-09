# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY . .

ARG NUXT_PUBLIC_APP_BASEURL=/dashboard/
ENV NUXT_PUBLIC_APP_BASEURL=$NUXT_PUBLIC_APP_BASEURL

# Файл БД для prisma generate (реальные данные задаёт runtime DATABASE_URL)
ENV DATABASE_URL="file:./build-placeholder.db"
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && test -f /app/prisma/schema.prisma \
  && test -x /app/node_modules/.bin/prisma

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
