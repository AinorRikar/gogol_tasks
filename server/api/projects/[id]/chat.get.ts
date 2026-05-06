import { createError, getRouterParam } from "h3";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "../../../utils/auth";
import { canAccessProject, getProjectWithMembers } from "../../../utils/project";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);

  const isAssignedClient = currentUser.role === UserRole.CLIENT && project.members.some((member) => member.userId === currentUser.id);
  const isDeveloperOwner = currentUser.role === UserRole.DEVELOPER && project.createdById === currentUser.id;
  if (!canAccessProject(project, currentUser.id) || (!isAssignedClient && !isDeveloperOwner)) {
    throw createError({ statusCode: 403, statusMessage: "No access to project chat" });
  }

  return prisma.chatMessage.findMany({
    where: { projectId },
    include: {
      author: true
    },
    orderBy: { createdAt: "asc" }
  });
});
