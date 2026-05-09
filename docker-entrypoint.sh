#!/bin/sh
set -e
cd /app
# Применить схему к SQLite в томе (идемпотентно для продакшена)
npx prisma db push --skip-generate
exec node .output/server/index.mjs
