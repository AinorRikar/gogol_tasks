/**
 * POST /api/projects/:id/links — добавить ссылку; title и iconUrl подтягиваются с сайта.
 */
import { UserRole } from "@prisma/client";
import { createError, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { getCurrentUser } from "../../../../utils/auth";
import { fetchLinkMetadata } from "../../../../utils/linkMetadata";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

const bodySchema = z.object({
  url: z.string().min(4).max(2048)
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);

  if (currentUser.role !== UserRole.DEVELOPER || project.createdById !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: "Only developer owner can add links" });
  }

  const { url } = bodySchema.parse(await readBody(event));

  let metadata;
  try {
    metadata = await fetchLinkMetadata(url);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid URL" });
  }

  const maxOrder = await prisma.projectLink.aggregate({
    where: { projectId },
    _max: { order: true }
  });

  return prisma.projectLink.create({
    data: {
      projectId,
      url: metadata.url,
      title: metadata.title,
      iconUrl: metadata.iconUrl,
      order: (maxOrder._max.order ?? -1) + 1
    },
    select: {
      id: true,
      projectId: true,
      url: true,
      title: true,
      iconUrl: true,
      order: true,
      createdAt: true
    }
  });
});
