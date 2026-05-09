/**
 * POST /api/projects/:id/images
 * Multipart поле file. Только DEVELOPER-владелец проекта. Файл в public/uploads/projects/, запись в Prisma с fileUrl относительным.
 */
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { UserRole } from "@prisma/client";
import { createError, getRouterParam, readMultipartFormData } from "h3";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);

  if (currentUser.role !== UserRole.DEVELOPER || project.createdById !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: "Only developer owner can upload images" });
  }

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((part) => part.name === "file");
  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: "Image file is required" });
  }

  if (!filePart.type?.startsWith("image/")) {
    throw createError({ statusCode: 400, statusMessage: "Only image files are allowed" });
  }

  const uploadsDir = join(process.cwd(), "public", "uploads", "projects");
  await mkdir(uploadsDir, { recursive: true });

  const ext = extname(filePart.filename) || ".jpg";
  const safeName = `${randomUUID()}${ext}`;
  const diskPath = join(uploadsDir, safeName);
  await writeFile(diskPath, filePart.data);

  return prisma.projectImage.create({
    data: {
      projectId,
      uploadedById: currentUser.id,
      fileName: filePart.filename,
      fileUrl: `/uploads/projects/${safeName}`,
      mimeType: filePart.type
    },
    include: {
      uploadedBy: {
        select: { id: true, name: true }
      }
    }
  });
});
