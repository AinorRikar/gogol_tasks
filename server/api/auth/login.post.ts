/**
 * POST /api/auth/login
 * Тело: email, password. Проверка пароля по hash в БД, выдача JWT в httpOnly-cookie.
 * Ответ: публичные поля пользователя (без passwordHash).
 */
import { createError, readBody } from "h3";
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { setAuthCookie, signAuth, verifyPassword } from "../../utils/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export default defineEventHandler(async (event) => {
  const payload = loginSchema.parse(await readBody(event));
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: "Invalid credentials" });
  }

  const token = signAuth(user.id);
  setAuthCookie(event, token);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
});
