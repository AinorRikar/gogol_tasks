/**
 * GET /api/integration/portfolio
 * Только с JWT интеграции (MySite). Список проектов с useForPortfolio, без архива; маскировка как для анонимного зрителя.
 */
import { assertSiteIntegrationToken } from "../../utils/integration";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  assertSiteIntegrationToken(event);

  const projects = await prisma.project.findMany({
    where: { archivedAt: null, useForPortfolio: true },
    include: {
      members: { include: { user: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return projects.map((project) => {
    const isAssigned = false;
    const canReadHiddenProject = false;
    const isHiddenForViewer = project.hidden && !canReadHiddenProject;
    const canReadDescription = project.visibility || isAssigned;
    const canOpen = project.visibility || isAssigned;

    return {
      id: project.id,
      title: isHiddenForViewer ? "Скрытый проект" : project.title,
      description: isHiddenForViewer
        ? "Проект скрыт от общего доступа по требованию заказчика"
        : canReadDescription
          ? project.description
          : undefined,
      status: project.status,
      visibility: project.visibility,
      hidden: project.hidden,
      useForPortfolio: project.useForPortfolio,
      techStack: isHiddenForViewer ? "" : canReadDescription ? project.techStack : "",
      canOpen,
      archivedAt: project.archivedAt,
      isAssigned,
      members: project.members.map((member) => ({ id: member.user.id, name: member.user.name }))
    };
  });
});
