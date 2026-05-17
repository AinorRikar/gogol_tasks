#!/bin/sh
# Старт prod-контейнера: SQL-миграции старой SQLite (email→login, description→shortDescription),
# затем prisma db push, затем Nitro. См. DEPLOY.md.
set -e
cd /app
SCHEMA=/app/prisma/schema.prisma
DB_FILE=/data/prod.db

if ! test -f "$SCHEMA"; then
  echo "[entrypoint] Prisma schema not found at $SCHEMA" >&2
  ls -la /app/prisma 2>&1 || true
  exit 1
fi

echo "[entrypoint] DATABASE_URL=${DATABASE_URL:-<unset>}"

# Старая prod-БД: колонка email мешает db push (схема уже с login).
if test -f "$DB_FILE" && command -v sqlite3 >/dev/null 2>&1; then
  if sqlite3 "$DB_FILE" "SELECT 1 FROM pragma_table_info('User') WHERE name='email' LIMIT 1;" 2>/dev/null | grep -q 1; then
    echo "[entrypoint] Migrating User.email -> login..."
    if test -f /app/prisma/migrations/email-to-login.sql; then
      sqlite3 "$DB_FILE" < /app/prisma/migrations/email-to-login.sql
    else
      echo "[entrypoint] WARNING: migration SQL missing, db push may fail" >&2
    fi
  fi
else
  echo "[entrypoint] Skip email migration (no DB or no sqlite3)"
fi

if test -f "$DB_FILE" && command -v sqlite3 >/dev/null 2>&1; then
  if sqlite3 "$DB_FILE" "SELECT 1 FROM pragma_table_info('Project') WHERE name='description' LIMIT 1;" 2>/dev/null | grep -q 1; then
    echo "[entrypoint] Migrating Project.description -> short/full..."
    if test -f /app/prisma/migrations/project-descriptions.sql; then
      sqlite3 "$DB_FILE" < /app/prisma/migrations/project-descriptions.sql
    else
      echo "[entrypoint] WARNING: project-descriptions.sql missing" >&2
    fi
  fi
fi

echo "[entrypoint] prisma db push..."
if ! ./node_modules/.bin/prisma db push --skip-generate --schema="$SCHEMA"; then
  echo "[entrypoint] FATAL: prisma db push failed. Container will not start (nginx → 502)." >&2
  echo "[entrypoint] On server: docker logs gogol-dashboard --tail 50" >&2
  echo "[entrypoint] See DEPLOY.md — migration email→login or backup volume gogol-sqlite-data" >&2
  exit 1
fi

echo "[entrypoint] Starting Nitro on :${NITRO_PORT:-3000}..."
exec node .output/server/index.mjs
