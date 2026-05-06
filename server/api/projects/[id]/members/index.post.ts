import { UserRole } from "@prisma/client";
import { createError, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { assertDeveloper, getCurrentUser } from "../../../../utils/auth";
import { prisma } from "../../../../utils/prisma";

const addMemberSchema = z.object({
  userId: z.number().int().positive()
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const projectId = Number(getRouterParam(event, "id"));
  const payload = addMemberSchema.parse(await readBody(event));
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== UserRole.CLIENT) {
    throw createError({ statusCode: 400, statusMessage: "Only client can be added as member" });
  }

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId: payload.userId
      }
    },
    update: {},
    create: {
      projectId,
      userId: payload.userId
    }
  });

  return { ok: true };
});
