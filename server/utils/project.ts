/**
 * Общие операции с проектом для API: загрузка с участниками и проверка «видимости» для приватных проектов.
 */
import { UserRole } from "@prisma/client";
import { createError, type H3Event } from "h3";
import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

/** Загружает проект по id вместе с ProjectMember и вложенным User. 404 если не найден. */
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

/**
 * Может ли пользователь userId считаться «имеющим доступ» к приватному проекту (visibility = false):
 * участник проекта или создатель. Для публичных проектов (visibility = true) доступ к списку шире — см. эндпоинты.
 */
export const canAccessProject = (project: Awaited<ReturnType<typeof getProjectWithMembers>>, userId: number) => {
  if (project.visibility) return true;
  return project.members.some((member) => member.userId === userId) || project.createdById === userId;
};

/** Только владелец-разработчик проекта (CRUD справочных блоков, ссылки, изображения). */
export const assertProjectOwnerDeveloper = async (event: H3Event, projectId: number) => {
  const currentUser = await getCurrentUser(event);
  const project = await getProjectWithMembers(projectId);
  if (currentUser.role !== UserRole.DEVELOPER || project.createdById !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: "Only developer owner can perform this action" });
  }
  return { currentUser, project };
};
