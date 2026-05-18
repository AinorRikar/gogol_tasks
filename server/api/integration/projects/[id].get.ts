/**
 * GET /api/integration/projects/:id
 * Кто может: JWT integration. Один портфельный проект; 403 если приватный; 404 если не в выборке.
 */
import { createError, getRouterParam } from "h3";
import { assertSiteIntegrationToken } from "../../../utils/integration";
import { portfolioProjectInclude, serializePortfolioProject } from "../../../utils/integrationProject";
import { canAccessProject, getProjectWithMembers } from "../../../utils/project";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  assertSiteIntegrationToken(event);
  const id = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(id);

  if (!project.useForPortfolio || project.archivedAt) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  if (!project.visibility && !canAccessProject(project, -1)) {
    throw createError({ statusCode: 403, statusMessage: "No access to this project" });
  }

  const full = await prisma.project.findUnique({
    where: { id },
    include: portfolioProjectInclude
  });

  if (!full) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return serializePortfolioProject(event, full);
});
