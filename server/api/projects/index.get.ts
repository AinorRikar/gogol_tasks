/**
 * GET /api/projects
 */
import { ProjectStatus } from "@prisma/client";
import { getQuery } from "h3";
import { getCurrentUserOptional } from "../../utils/auth";
import { buildProjectAccessContext, serializeProjectListItem } from "../../utils/projectSerializer";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUserOptional(event);
  const query = getQuery(event);
  const requestedStatus = query.status as ProjectStatus | undefined;
  const requestedVisibility = query.visibility as "PUBLIC" | "PRIVATE" | undefined;
  const includeArchived = query.includeArchived === "true";
  const portfolioOnly = query.portfolioOnly === "true";

  const projects = await prisma.project.findMany({
    where: {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(requestedStatus ? { status: requestedStatus } : {}),
      ...(requestedVisibility ? { visibility: requestedVisibility === "PUBLIC" } : {}),
      ...(portfolioOnly ? { useForPortfolio: true } : {})
    },
    include: {
      members: { include: { user: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return projects.map((project) => {
    const ctx = buildProjectAccessContext(project, currentUser);
    return serializeProjectListItem(project, ctx);
  });
});
