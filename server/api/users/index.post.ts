import { UserRole } from "@prisma/client";
import { readBody } from "h3";
import { z } from "zod";
import { getCurrentUser, assertDeveloper, hashPassword } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  password: z.string().min(4)
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const payload = createUserSchema.parse(await readBody(event));
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      passwordHash: hashPassword(payload.password)
    }
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
});
