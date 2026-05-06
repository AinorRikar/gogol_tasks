import { TaskStatus } from "@prisma/client";
import { createError, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO)
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);
  const isAssigned = project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id;
  if (!isAssigned) {
    throw createError({ statusCode: 403, statusMessage: "No access to project tasks" });
  }

  const payload = createTaskSchema.parse(await readBody(event));
  const maxOrder = await prisma.projectTask.aggregate({
    where: { projectId, status: payload.status },
    _max: { order: true }
  });

  return prisma.projectTask.create({
    data: {
      projectId,
      title: payload.title,
      description: payload.description,
      assigneeId: null,
      status: payload.status,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });
});
