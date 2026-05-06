import { ProjectStatus } from "@prisma/client";
import { getQuery } from "h3";
import { getCurrentUserOptional } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUserOptional(event);
  const query = getQuery(event);
  const requestedStatus = query.status as ProjectStatus | undefined;
  const requestedVisibility = query.visibility as "PUBLIC" | "PRIVATE" | undefined;
  const includeArchived = query.includeArchived === "true";

  const projects = await prisma.project.findMany({
    where: {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(requestedStatus ? { status: requestedStatus } : {}),
      ...(requestedVisibility ? { visibility: requestedVisibility === "PUBLIC" } : {})
    },
    include: {
      members: { include: { user: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return projects.map((project) => {
    const isAssigned = currentUser
      ? project.members.some((member) => member.userId === currentUser.id) || project.createdById === currentUser.id
      : false;
    const canReadHiddenProject = !!currentUser && (currentUser.role === "DEVELOPER" || isAssigned);
    const isHiddenForViewer = project.hidden && !canReadHiddenProject;
    const canReadDescription = project.visibility || (!!currentUser && (currentUser.role === "DEVELOPER" || isAssigned));
    const canOpen = project.visibility || (!!currentUser && (currentUser.role === "DEVELOPER" || isAssigned));
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
      canOpen,
      archivedAt: project.archivedAt,
      isAssigned,
      members: project.members.map((member) => ({ id: member.user.id, name: member.user.name }))
    };
  });
});
