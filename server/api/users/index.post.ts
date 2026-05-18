/**
 * POST /api/users
 * Только DEVELOPER: создаёт клиента (имя, логин, пароль).
 */
import { Prisma, UserRole } from "@prisma/client";
import { createError, readBody } from "h3";
import { z } from "zod";
import { assertDeveloper, getCurrentUser, hashPassword } from "../../utils/auth";
import { prisma } from "../../utils/prisma";
import { loginFieldSchema, toPublicUser } from "../../utils/user";

const createClientSchema = z.object({
  name: z.string().min(2),
  login: loginFieldSchema,
  password: z.string().min(4)
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const payload = createClientSchema.parse(await readBody(event));

  try {
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        login: payload.login,
        role: UserRole.CLIENT,
        passwordHash: hashPassword(payload.password)
      }
    });
    return toPublicUser(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw createError({ statusCode: 409, statusMessage: "Login already taken" });
    }
    throw error;
  }
});
