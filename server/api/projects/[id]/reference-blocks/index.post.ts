/**
 * POST /api/projects/:id/reference-blocks
 */
import { getRouterParam, readBody } from "h3";
import { z } from "zod";
import { assertProjectOwnerDeveloper } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000)
});

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, "id"));
  await assertProjectOwnerDeveloper(event, projectId);
  const payload = bodySchema.parse(await readBody(event));

  const maxOrder = await prisma.projectReferenceBlock.aggregate({
    where: { projectId },
    _max: { order: true }
  });

  return prisma.projectReferenceBlock.create({
    data: {
      projectId,
      title: payload.title,
      content: payload.content,
      order: (maxOrder._max.order ?? -1) + 1
    }
  });
});
