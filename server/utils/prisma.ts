/**
 * Единственный экземпляр PrismaClient на процесс.
 *
 * В development Nuxt/Nitro перезагружает модули при hot reload — без сохранения клиента
 * в globalThis создавались бы множественные подключения к SQLite. В production один процесс.
 *
 * Клиент генерируется командой `prisma generate` из prisma/schema.prisma (тип PrismaClient).
 * log: в dev пишем query/error/warn в консоль для отладки SQL.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
