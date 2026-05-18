/**
 * POST /api/auth/login
 * Тело: login, password. JWT в httpOnly-cookie.
 */
import { createError, readBody } from "h3";
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { setAuthCookie, signAuth, verifyPassword } from "../../utils/auth";
import { loginFieldSchema, toPublicUser } from "../../utils/user";

const loginSchema = z.object({
  login: loginFieldSchema,
  password: z.string().min(4)
});

export default defineEventHandler(async (event) => {
  const payload = loginSchema.parse(await readBody(event));
  const user = await prisma.user.findUnique({ where: { login: payload.login } });
  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  setAuthCookie(event, signAuth(user.id));
  return toPublicUser(user);
});
