import { createError, getRouterParam } from "h3";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);
  const isAssigned = project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id;
  if (!isAssigned) {
    throw createError({ statusCode: 403, statusMessage: "No access to project tasks" });
  }

  return prisma.projectTask.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: { id: true, name: true, role: true }
      }
    },
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "asc" }]
  });
});
