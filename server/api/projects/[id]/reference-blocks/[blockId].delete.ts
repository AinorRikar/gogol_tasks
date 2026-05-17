/**
 * DELETE /api/projects/:id/reference-blocks/:blockId
 */
import { createError, getRouterParam } from "h3";
import { assertProjectOwnerDeveloper } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, "id"));
  const blockId = Number(getRouterParam(event, "blockId"));
  await assertProjectOwnerDeveloper(event, projectId);

  const existing = await prisma.projectReferenceBlock.findUnique({ where: { id: blockId } });
  if (!existing || existing.projectId !== projectId) {
    throw createError({ statusCode: 404, statusMessage: "Reference block not found" });
  }

  await prisma.projectReferenceBlock.delete({ where: { id: blockId } });
  return { ok: true };
});
