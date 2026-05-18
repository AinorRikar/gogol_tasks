/**
 * GET /api/projects/:id
 */
import { createError, getRouterParam } from "h3";
import { getCurrentUserOptional } from "../../utils/auth";
import { canAccessProject, getProjectWithMembers } from "../../utils/project";
import { buildProjectAccessContext, serializeProjectDetail } from "../../utils/projectSerializer";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUserOptional(event);
  const id = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(id);

  const userId = currentUser?.id ?? -1;
  const isDeveloper = currentUser?.role === "DEVELOPER";
  if (!project.visibility && !isDeveloper && !canAccessProject(project, userId)) {
    throw createError({ statusCode: 403, statusMessage: "No access to this project" });
  }

  const ctx = buildProjectAccessContext(project, currentUser);
  return serializeProjectDetail(project, ctx);
});
