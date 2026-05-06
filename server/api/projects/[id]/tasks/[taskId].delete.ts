import { createError, getRouterParam } from "h3";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const taskId = Number(getRouterParam(event, "taskId"));
  const project = await getProjectWithMembers(projectId);
  const isAssigned = project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id;
  if (!isAssigned) {
    throw createError({ statusCode: 403, statusMessage: "No access to project tasks" });
  }

  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Task not found" });
  }

  await prisma.projectTask.delete({ where: { id: taskId } });
  return { ok: true };
});
