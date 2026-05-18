/**
 * DELETE /api/projects/:id/links/:linkId
 */
import { UserRole } from "@prisma/client";
import { createError, getRouterParam } from "h3";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const linkId = Number(getRouterParam(event, "linkId"));
  const project = await getProjectWithMembers(projectId);

  if (currentUser.role !== UserRole.DEVELOPER || project.createdById !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: "Only developer owner can delete links" });
  }

  const link = await prisma.projectLink.findUnique({ where: { id: linkId } });
  if (!link || link.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Link not found" });
  }

  await prisma.projectLink.delete({ where: { id: linkId } });
  return { ok: true };
});
