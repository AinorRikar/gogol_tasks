/**
 * GET /api/integration/portfolio
 * Кто может: JWT integration (INTEGRATION_SECRET).
 * Ответ: массив портфельных проектов (useForPortfolio, не в архиве), полный DTO — см. API.md.
 */
import { assertSiteIntegrationToken } from "../../utils/integration";
import { portfolioProjectInclude, serializePortfolioProject } from "../../utils/integrationProject";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  assertSiteIntegrationToken(event);

  const projects = await prisma.project.findMany({
    where: { archivedAt: null, useForPortfolio: true },
    include: portfolioProjectInclude,
    orderBy: { updatedAt: "desc" }
  });

  return projects.map((project) => serializePortfolioProject(event, project));
});
