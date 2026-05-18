/**
 * POST /api/projects/:id/chat
 * Тело: text. Писать могут только назначенный CLIENT или владелец DEVELOPER; Prisma chatMessage.create + sentAt.
 */
import { createError, readBody, getRouterParam } from "h3";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { getCurrentUser } from "../../../utils/auth";
import { getProjectWithMembers } from "../../../utils/project";
import { prisma } from "../../../utils/prisma";

const createMessageSchema = z.object({
  text: z.string().min(1).max(2000)
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);
  const payload = createMessageSchema.parse(await readBody(event));

  const isAssignedClient = currentUser.role === UserRole.CLIENT && project.members.some((member) => member.userId === currentUser.id);
  const isDeveloperOwner = currentUser.role === UserRole.DEVELOPER && project.createdById === currentUser.id;
  if (!isAssignedClient && !isDeveloperOwner) {
    throw createError({ statusCode: 403, statusMessage: "Only assigned users can write to chat" });
  }

  return prisma.chatMessage.create({
    data: {
      projectId,
      authorId: currentUser.id,
      text: payload.text,
      sentAt: new Date()
    },
    include: { author: true }
  });
});
