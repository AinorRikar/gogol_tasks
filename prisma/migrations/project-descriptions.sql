-- Миграция: description → shortDescription + fullDescription + version
-- Запуск: sqlite3 /path/to/db < prisma/migrations/project-descriptions.sql

ALTER TABLE "Project" RENAME COLUMN "description" TO "shortDescription";
ALTER TABLE "Project" ADD COLUMN "fullDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN "version" TEXT NOT NULL DEFAULT '';
UPDATE "Project" SET "fullDescription" = "shortDescription";
