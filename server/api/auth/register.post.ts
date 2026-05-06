import { Prisma } from "@prisma/client";
import { createError, readBody } from "h3";
import { z } from "zod";
import { hashPassword, setAuthCookie, signAuth } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  role: z.enum(["DEVELOPER", "CLIENT"]).default("CLIENT")
});

export default defineEventHandler(async (event) => {
  const payload = registerSchema.parse(await readBody(event));

  try {
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash: hashPassword(payload.password),
        role: payload.role
      }
    });

    const token = signAuth(user.id);
    setAuthCookie(event, token);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw createError({ statusCode: 409, statusMessage: "Email already exists" });
    }
    throw error;
  }
});
