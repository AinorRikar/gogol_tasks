-- Миграция: email → login (сохраняет существующие строки).
-- Запуск: sqlite3 prisma/dev.db < prisma/migrations/email-to-login.sql

ALTER TABLE "User" RENAME COLUMN "email" TO "login";

UPDATE "User" SET "login" = 'admin' WHERE "role" = 'DEVELOPER';
UPDATE "User" SET "login" = 'maria' WHERE "login" = 'maria@client.local';
UPDATE "User" SET "login" = 'ivan' WHERE "login" = 'ivan@client.local';
UPDATE "User" SET "login" = substr("login", 1, instr("login", '@') - 1)
WHERE "login" LIKE '%@%';
