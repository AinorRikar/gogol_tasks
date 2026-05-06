import { TaskStatus } from "@prisma/client";
import { createError, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  assigneeId: z.number().int().positive().nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  order: z.number().int().nonnegative().optional()
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const taskId = Number(getRouterParam(event, "taskId"));
  const project = await getProjectWithMembers(projectId);
  const isAssigned = project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id;
  if (!isAssigned) {
    throw createError({ statusCode: 403, statusMessage: "No access to project tasks" });
  }

  const payload = updateTaskSchema.parse(await readBody(event));
  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Task not found" });
  }

  return prisma.projectTask.update({
    where: { id: taskId },
    data: {
      title: payload.title,
      description: payload.description === null ? null : payload.description,
      assigneeId: payload.assigneeId === null ? null : payload.assigneeId,
      status: payload.status,
      order: payload.order
    }
  });
});
