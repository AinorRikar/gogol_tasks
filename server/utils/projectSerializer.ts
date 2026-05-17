/**
 * DTO проекта для CRM API: маскировка hidden, видимость описаний, список участников.
 * Integration API расширяет ответ в integrationProject.ts.
 */
import type { User } from "@prisma/client";
import { canAccessProject } from "./project";

type ProjectWithMembers = Awaited<ReturnType<typeof import("./project").getProjectWithMembers>>;

export type ProjectAccessContext = {
  isAssigned: boolean;
  canReadHiddenProject: boolean;
  isHiddenForViewer: boolean;
  canReadDescription: boolean;
  canOpen: boolean;
};

export const buildProjectAccessContext = (
  project: Pick<ProjectWithMembers, "visibility" | "hidden" | "members" | "createdById">,
  currentUser: User | null
): ProjectAccessContext => {
  const isAssigned = !!currentUser &&
    (project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id);
  const canReadHiddenProject = !!currentUser && (currentUser.role === "DEVELOPER" || isAssigned);
  const isHiddenForViewer = project.hidden && !canReadHiddenProject;
  const canReadDescription = project.visibility || (!!currentUser && (currentUser.role === "DEVELOPER" || isAssigned));
  const canOpen = project.visibility || (!!currentUser && (currentUser.role === "DEVELOPER" || isAssigned));

  return {
    isAssigned,
    canReadHiddenProject,
    isHiddenForViewer,
    canReadDescription,
    canOpen
  };
};

const hiddenPlaceholder = "Проект скрыт от общего доступа по требованию заказчика";

export const serializeProjectListItem = (
  project: ProjectWithMembers,
  ctx: ProjectAccessContext
) => ({
  id: project.id,
  title: ctx.isHiddenForViewer ? "Скрытый проект" : project.title,
  shortDescription: ctx.isHiddenForViewer
    ? hiddenPlaceholder
    : ctx.canReadDescription
      ? project.shortDescription
      : undefined,
  version: ctx.isHiddenForViewer ? "" : ctx.canReadDescription ? project.version : "",
  status: project.status,
  visibility: project.visibility,
  hidden: project.hidden,
  useForPortfolio: project.useForPortfolio,
  techStack: ctx.isHiddenForViewer ? "" : ctx.canReadDescription ? project.techStack : "",
  canOpen: ctx.canOpen,
  archivedAt: project.archivedAt,
  isAssigned: ctx.isAssigned,
  members: project.members.map((member) => ({ id: member.user.id, name: member.user.name }))
});

export const serializeProjectDetail = (project: ProjectWithMembers, ctx: ProjectAccessContext) => ({
  ...serializeProjectListItem(project, ctx),
  fullDescription: ctx.isHiddenForViewer
    ? hiddenPlaceholder
    : ctx.canReadDescription
      ? project.fullDescription
      : undefined
});

export const assertProjectReadable = (
  project: ProjectWithMembers,
  currentUser: User | null
) => {
  const userId = currentUser?.id ?? -1;
  const isDeveloper = currentUser?.role === "DEVELOPER";
  if (!project.visibility && !isDeveloper && !canAccessProject(project, userId)) {
    return false;
  }
  const ctx = buildProjectAccessContext(project, currentUser);
  if (ctx.isHiddenForViewer) return false;
  return true;
};
