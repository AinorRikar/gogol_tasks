/**
 * GET /api/projects/:id/links — список ссылок проекта (title, iconUrl с целевого сайта).
 */
import { getRouterParam } from "h3";
import { getReadableProject } from "../../../../utils/projectAccess";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const projectId = Number(getRouterParam(event, "id"));
  await getReadableProject(event, projectId);

  return prisma.projectLink.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
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
