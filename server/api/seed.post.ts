/**
 * POST /api/seed
 * Демо-данные. Учётка разработчика: login admin, пароль 12345678.
 */
import { ProjectStatus, UserRole } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { hashPassword } from "../utils/auth";

const DEV_LOGIN = "admin";
const DEV_PASSWORD = "12345678";

export default defineEventHandler(async () => {
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    const existingDeveloper = await prisma.user.findUnique({ where: { login: DEV_LOGIN } });
    if (existingDeveloper) {
      await prisma.user.update({
        where: { id: existingDeveloper.id },
        data: {
          name: "Разработчик",
          role: UserRole.DEVELOPER,
          passwordHash: hashPassword(DEV_PASSWORD)
        }
      });
    } else {
      const anyDeveloper = await prisma.user.findFirst({ where: { role: UserRole.DEVELOPER } });
      if (anyDeveloper) {
        await prisma.user.update({
          where: { id: anyDeveloper.id },
          data: {
            name: "Разработчик",
            login: DEV_LOGIN,
            passwordHash: hashPassword(DEV_PASSWORD)
          }
        });
      } else {
        await prisma.user.create({
          data: {
            name: "Разработчик",
            login: DEV_LOGIN,
            passwordHash: hashPassword(DEV_PASSWORD),
            role: UserRole.DEVELOPER
          }
        });
      }
    }

    const existingUsers = await prisma.user.findMany();
    await Promise.all(
      existingUsers
        .filter((user) => !user.passwordHash)
        .map((user) =>
          prisma.user.update({
            where: { id: user.id },
            data: {
              passwordHash: hashPassword(user.role === UserRole.DEVELOPER ? DEV_PASSWORD : "client123")
            }
          })
        )
    );

    return {
      seeded: false,
      reason: "Already seeded",
      credentials: [
        { login: DEV_LOGIN, password: DEV_PASSWORD, role: "DEVELOPER" },
        { login: "maria", password: "client123", role: "CLIENT" },
        { login: "ivan", password: "client123", role: "CLIENT" }
      ]
    };
  }

  const developer = await prisma.user.create({
    data: {
      name: "Разработчик",
      login: DEV_LOGIN,
      passwordHash: hashPassword(DEV_PASSWORD),
      role: UserRole.DEVELOPER
    }
  });

  const clients = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Мария Заказчик",
        login: "maria",
        passwordHash: hashPassword("client123"),
        role: UserRole.CLIENT
      }
    }),
    prisma.user.create({
      data: {
        name: "Иван Заказчик",
        login: "ivan",
        passwordHash: hashPassword("client123"),
        role: UserRole.CLIENT
      }
    })
  ]);

  const crmTechStack =
    "Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Prisma, SQLite, Zod, Nitro, Nuxt Icon, Nuxt Color Mode, JWT";

  const project = await prisma.project.create({
    data: {
      title: "CRM dashboard",
      shortDescription: "Публичный проект для демонстрации прогресса и аналитики.",
      fullDescription:
        "CRM dashboard — демо-проект с канбаном, чатом и галереей. Пример для Integration API (портфолио).",
      version: "1.0.0",
      status: ProjectStatus.ACTIVE,
      visibility: true,
      useForPortfolio: true,
      techStack: crmTechStack,
      createdById: developer.id,
      members: {
        create: clients.map((client) => ({ userId: client.id }))
      },
      referenceBlocks: {
        create: [
          { title: "Активные пользователи", content: "+40% за квартал", order: 0 },
          { title: "Время отклика API", content: "p95 < 120 мс", order: 1 }
        ]
      }
    }
  });

  await prisma.chatMessage.create({
    data: {
      projectId: project.id,
      authorId: developer.id,
      text: "Добро пожаловать в проектный чат."
    }
  });

  await prisma.project.create({
    data: {
      title: "Private maintenance sprint",
      shortDescription: "Спринт техподдержки для отдельного клиента.",
      fullDescription: "Закрытый спринт техподдержки — без публикации в портфолио.",
      version: "0.9.2",
      status: ProjectStatus.SUPPORTED,
      visibility: false,
      createdById: developer.id,
      members: {
        create: [{ userId: clients[0].id }]
      }
    }
  });

  await prisma.projectTask.createMany({
    data: [
      { projectId: project.id, title: "Собрать требования", status: "TODO", order: 0, assigneeId: clients[0].id },
      { projectId: project.id, title: "Согласовать дизайн", status: "IN_PROGRESS", order: 0, assigneeId: developer.id },
      { projectId: project.id, title: "Подготовить API", status: "DONE", order: 0, assigneeId: developer.id }
    ]
  });

  return {
    seeded: true,
    credentials: [
      { login: DEV_LOGIN, password: DEV_PASSWORD, role: "DEVELOPER" },
      { login: "maria", password: "client123", role: "CLIENT" },
      { login: "ivan", password: "client123", role: "CLIENT" }
    ]
  };
});
