/**
 * GET /api/users — только DEVELOPER: список пользователей с проектами клиентов.
 */
import { UserRole } from "@prisma/client";
import { assertDeveloper, getCurrentUser } from "../../utils/auth";
import { prisma } from "../../utils/prisma";
import { publicUserSelect, toPublicUser } from "../../utils/user";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const users = await prisma.user.findMany({
    select: {
      ...publicUserSelect,
      memberships: {
        select: {
          project: {
            select: { id: true, title: true }
          }
        }
      }
    },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });

  return users.map((user) => {
    const base = toPublicUser(user);
    if (user.role !== UserRole.CLIENT) {
      return base;
    }

    const projects = user.memberships.map((membership) => ({
      id: membership.project.id,
      title: membership.project.title
    }));

    return { ...base, projects };
  });
});
