/**
 * DELETE /api/users/:id — только DEVELOPER: удаление клиента.
 */
import { UserRole } from "@prisma/client";
import { createError, getRouterParam } from "h3";
import { assertDeveloper, getCurrentUser } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid user id" });
  }

  if (id === currentUser.id) {
    throw createError({ statusCode: 400, statusMessage: "Cannot delete yourself" });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { createdProjects: true } } }
  });

  if (!target) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  if (target.role !== UserRole.CLIENT) {
    throw createError({ statusCode: 403, statusMessage: "Only clients can be deleted" });
  }

  if (target._count.createdProjects > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Client has created projects and cannot be deleted"
    });
  }

  await prisma.user.delete({ where: { id } });
  return { ok: true };
});
