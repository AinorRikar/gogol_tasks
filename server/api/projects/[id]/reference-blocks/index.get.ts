/**
 * GET /api/projects/:id/reference-blocks — только DEVELOPER-владелец.
 */
import { getRouterParam } from "h3";
import { assertProjectOwnerDeveloper } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, "id"));
  await assertProjectOwnerDeveloper(event, projectId);

  return prisma.projectReferenceBlock.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      projectId: true,
      title: true,
      content: true,
      order: true,
      createdAt: true,
      updatedAt: true
    }
  });
});
