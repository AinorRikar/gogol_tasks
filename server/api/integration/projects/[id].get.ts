/**
 * GET /api/integration/projects/:id
 * Карточка проекта для витрины MySite: только useForPortfolio и не в архиве; права как у гостя (приватный → 403).
 */
import { createError, getRouterParam } from "h3";
import { assertSiteIntegrationToken } from "../../../utils/integration";
import { canAccessProject, getProjectWithMembers } from "../../../utils/project";

export default defineEventHandler(async (event) => {
  assertSiteIntegrationToken(event);
  const id = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(id);

  if (!project.useForPortfolio || project.archivedAt) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const userId = -1;
  if (!project.visibility && !canAccessProject(project, userId)) {
    throw createError({ statusCode: 403, statusMessage: "No access to this project" });
  }

  const isAssigned = false;
  const canReadHiddenProject = false;
  const isHiddenForViewer = project.hidden && !canReadHiddenProject;
  const canReadDescription = project.visibility || isAssigned;

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
    canOpen: true,
    archivedAt: project.archivedAt,
    isAssigned,
    members: project.members.map((member) => ({ id: member.user.id, name: member.user.name }))
  };
});
