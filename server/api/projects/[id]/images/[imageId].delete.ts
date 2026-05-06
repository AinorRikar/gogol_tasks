import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { UserRole } from "@prisma/client";
import { createError, getRouterParam } from "h3";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const imageId = Number(getRouterParam(event, "imageId"));
  const project = await getProjectWithMembers(projectId);

  if (currentUser.role !== UserRole.DEVELOPER || project.createdById !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: "Only developer owner can delete images" });
  }

  const image = await prisma.projectImage.findUnique({ where: { id: imageId } });
  if (!image || image.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Image not found" });
  }

  await prisma.projectImage.delete({ where: { id: imageId } });
  const diskPath = join(process.cwd(), "public", image.fileUrl.replace(/^\//, ""));
  try {
    await unlink(diskPath);
  } catch {
    // File may already be deleted, keep API idempotent.
  }

  return { ok: true };
});
