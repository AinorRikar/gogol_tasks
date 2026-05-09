/**
 * POST /api/seed
 * Демо-наполнение SQLite при пустой БД (пользователи, проекты, сообщения, задачи).
 * Если пользователи уже есть — обновляет пароли/роли заданной учётке и выходит без повторного сида.
 */
import { ProjectStatus, UserRole } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { hashPassword } from "../utils/auth";

export default defineEventHandler(async () => {
  const devEmail = "ainorrikar@gmail.com";
  const devPassword = "12345678";
  const usersCount = await prisma.user.count();
  if (usersCount > 0) {
    const existingDeveloperByEmail = await prisma.user.findUnique({ where: { email: devEmail } });
    if (existingDeveloperByEmail) {
      await prisma.user.update({
        where: { id: existingDeveloperByEmail.id },
        data: {
          name: "Ainor Rikar",
          role: UserRole.DEVELOPER,
          passwordHash: hashPassword(devPassword)
        }
      });
    } else {
      const anyDeveloper = await prisma.user.findFirst({ where: { role: UserRole.DEVELOPER } });
      if (anyDeveloper) {
        await prisma.user.update({
          where: { id: anyDeveloper.id },
          data: {
            name: "Ainor Rikar",
            email: devEmail,
            passwordHash: hashPassword(devPassword)
          }
        });
      } else {
        await prisma.user.create({
          data: {
            name: "Ainor Rikar",
            email: devEmail,
            passwordHash: hashPassword(devPassword),
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
              passwordHash: hashPassword(user.role === UserRole.DEVELOPER ? devPassword : "client123")
            }
          })
        )
    );
    return {
      seeded: false,
      reason: "Already seeded",
      credentials: [
        { email: devEmail, password: devPassword, role: "DEVELOPER" },
        { email: "maria@client.local", password: "client123", role: "CLIENT" },
        { email: "ivan@client.local", password: "client123", role: "CLIENT" }
      ]
    };
  }

  const developer = await prisma.user.create({
    data: {
      name: "Ainor Rikar",
      email: devEmail,
      passwordHash: hashPassword(devPassword),
      role: UserRole.DEVELOPER
    }
  });

  const clients = await prisma.$transaction([
    prisma.user.create({
      data: {
        name: "Мария Заказчик",
        email: "maria@client.local",
        passwordHash: hashPassword("client123"),
        role: UserRole.CLIENT
      }
    }),
    prisma.user.create({
      data: {
        name: "Иван Заказчик",
        email: "ivan@client.local",
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
      description: "Публичный проект для демонстрации прогресса и аналитики.",
      status: ProjectStatus.ACTIVE,
      visibility: true,
      techStack: crmTechStack,
      createdById: developer.id,
      members: {
        create: clients.map((client) => ({ userId: client.id }))
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
      description: "Спринт техподдержки для отдельного клиента.",
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
      { email: devEmail, password: devPassword, role: "DEVELOPER" },
      { email: "maria@client.local", password: "client123", role: "CLIENT" },
      { email: "ivan@client.local", password: "client123", role: "CLIENT" }
    ]
  };
});
