/**
 * GET /api/users
 * Список пользователей (id, name, email, role) для UI без чувствительных полей.
 * В коде нет проверки роли — при необходимости ограничьте через getCurrentUser + assertDeveloper.
 */
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });
});
