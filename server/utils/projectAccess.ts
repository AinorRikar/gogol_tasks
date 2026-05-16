/**
 * Проверка доступа к контенту проекта (галерея, ссылки и т.п.) — та же логика, что у GET images.
 */
import { createError, type H3Event } from "h3";
import { getCurrentUserOptional } from "./auth";
import { canAccessProject, getProjectWithMembers } from "./project";

export const getReadableProject = async (event: H3Event, projectId: number) => {
  const currentUser = await getCurrentUserOptional(event);
  const project = await getProjectWithMembers(projectId);

  const userId = currentUser?.id ?? -1;
  const isAssigned =
    !!currentUser &&
    (project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id);
  const canReadHiddenProject = !!currentUser && (currentUser.role === "DEVELOPER" || isAssigned);
  const isHiddenForViewer = project.hidden && !canReadHiddenProject;

  if ((!project.visibility && !canAccessProject(project, userId)) || isHiddenForViewer) {
    throw createError({ statusCode: 403, statusMessage: "No access to project" });
  }

  return { project, currentUser };
};
