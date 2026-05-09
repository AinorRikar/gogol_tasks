#!/bin/sh
set -e
cd /app
SCHEMA=/app/prisma/schema.prisma
if ! test -f "$SCHEMA"; then
  echo "Prisma schema not found at $SCHEMA (check Docker build context and COPY prisma)" >&2
  ls -la /app/prisma 2>&1 || true
  exit 1
fi
# Явный путь к схеме и к локальному CLI (npx в контейнере иногда не видит schema по умолчанию)
./node_modules/.bin/prisma db push --skip-generate --schema="$SCHEMA"
exec node .output/server/index.mjs
