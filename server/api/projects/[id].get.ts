import { createError, getRouterParam } from "h3";
import { getCurrentUserOptional } from "../../utils/auth";
import { canAccessProject, getProjectWithMembers } from "../../utils/project";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUserOptional(event);
  const id = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(id);

  const userId = currentUser?.id ?? -1;
  const isDeveloper = currentUser?.role === "DEVELOPER";
  if (!project.visibility && !isDeveloper && !canAccessProject(project, userId)) {
    throw createError({ statusCode: 403, statusMessage: "No access to this project" });
  }

  const isAssigned = !!currentUser && (project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id);
  const canReadHiddenProject = !!currentUser && (currentUser.role === "DEVELOPER" || isAssigned);
  const isHiddenForViewer = project.hidden && !canReadHiddenProject;
  const canReadDescription = project.visibility || (!!currentUser && (currentUser.role === "DEVELOPER" || isAssigned));

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
