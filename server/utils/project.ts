import { createError } from "h3";
import { prisma } from "./prisma";

export const getProjectWithMembers = async (projectId: number) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } }
    }
  });
  if (!project) throw createError({ statusCode: 404, statusMessage: "Project not found" });
  return project;
};

export const canAccessProject = (project: Awaited<ReturnType<typeof getProjectWithMembers>>, userId: number) => {
  if (project.visibility) return true;
  return project.members.some((member) => member.userId === userId) || project.createdById === userId;
};
