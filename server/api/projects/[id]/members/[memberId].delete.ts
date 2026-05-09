/**
 * DELETE /api/projects/:id/members/:memberId
 * Только DEVELOPER. Prisma projectMember.deleteMany по projectId + userId (memberId в URL = userId участника).
 */
import { getRouterParam } from "h3";
import { assertDeveloper, getCurrentUser } from "../../../../utils/auth";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const projectId = Number(getRouterParam(event, "id"));
  const memberId = Number(getRouterParam(event, "memberId"));

  await prisma.projectMember.deleteMany({
    where: {
      projectId,
      userId: memberId
    }
  });

  return { ok: true };
});
