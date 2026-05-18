/**
 * PATCH /api/users/me — обновление имени, логина и/или пароля текущего пользователя.
 */
import { Prisma } from "@prisma/client";
import { createError, readBody } from "h3";
import { getCurrentUser, hashPassword } from "../../utils/auth";
import { prisma } from "../../utils/prisma";
import { toPublicUser, updateProfileSchema } from "../../utils/user";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const payload = updateProfileSchema.parse(await readBody(event));

  try {
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.login ? { login: payload.login } : {}),
        ...(payload.password ? { passwordHash: hashPassword(payload.password) } : {})
      }
    });
    return toPublicUser(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw createError({ statusCode: 409, statusMessage: "Login already taken" });
    }
    throw error;
  }
});
