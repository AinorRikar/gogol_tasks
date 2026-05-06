import { ProjectStatus } from "@prisma/client";
import { getRouterParam, readBody } from "h3";
import { z } from "zod";
import { assertDeveloper, getCurrentUser } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  visibility: z.boolean().optional(),
  hidden: z.boolean().optional(),
  clientIds: z.array(z.number().int().positive()).optional()
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);
  const projectId = Number(getRouterParam(event, "id"));
  const payload = updateProjectSchema.parse(await readBody(event));

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      visibility: payload.visibility,
      hidden: payload.hidden
    }
  });

  if (payload.clientIds) {
    await prisma.projectMember.deleteMany({
      where: { projectId }
    });
    if (payload.clientIds.length) {
      await prisma.projectMember.createMany({
        data: payload.clientIds.map((userId) => ({ projectId, userId }))
      });
    }
  }

  return prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { user: true } } }
  });
});
