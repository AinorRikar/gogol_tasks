/**
 * POST /api/projects/:id/archive
 * Только DEVELOPER. Prisma: archivedAt = now() (мягкое архивирование, строка остаётся в БД).
 */
import { getRouterParam } from "h3";
import { assertDeveloper, getCurrentUser } from "../../../utils/auth";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const projectId = Number(getRouterParam(event, "id"));
  return prisma.project.update({
    where: { id: projectId },
    data: {
      archivedAt: new Date()
    }
  });
});
