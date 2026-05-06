import { createError, getRouterParam } from "h3";
import { getCurrentUserOptional } from "../../../../utils/auth";
import { canAccessProject, getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUserOptional(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);

  const userId = currentUser?.id ?? -1;
  const isAssigned = !!currentUser && (project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id);
  const canReadHiddenProject = !!currentUser && (currentUser.role === "DEVELOPER" || isAssigned);
  const isHiddenForViewer = project.hidden && !canReadHiddenProject;

  if ((!project.visibility && !canAccessProject(project, userId)) || isHiddenForViewer) {
    throw createError({ statusCode: 403, statusMessage: "No access to project gallery" });
  }

  return prisma.projectImage.findMany({
    where: { projectId },
    include: {
      uploadedBy: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
});
