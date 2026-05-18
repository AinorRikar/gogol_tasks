/**
 * PATCH /api/projects/:id/reference-blocks/:blockId
 */
import { createError, getRouterParam, readBody } from "h3";
import { z } from "zod";
import { assertProjectOwnerDeveloper } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

const bodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional()
});

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, "id"));
  const blockId = Number(getRouterParam(event, "blockId"));
  await assertProjectOwnerDeveloper(event, projectId);
  const payload = bodySchema.parse(await readBody(event));

  const existing = await prisma.projectReferenceBlock.findUnique({ where: { id: blockId } });
  if (!existing || existing.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Reference block not found" });
  }

  return prisma.projectReferenceBlock.update({
    where: { id: blockId },
    data: {
      title: payload.title,
      content: payload.content
    }
  });
});
