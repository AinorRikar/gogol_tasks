import type { User } from "@prisma/client";
import { z } from "zod";

export const publicUserSelect = {
  id: true,
  name: true,
  login: true,
  role: true
} as const;

export const toPublicUser = (user: Pick<User, "id" | "name" | "login" | "role">) => ({
  id: user.id,
  name: user.name,
  login: user.login,
  role: user.role
});

export const loginFieldSchema = z
  .string()
  .min(2)
  .max(32)
  .regex(/^[a-zA-Z0-9_-]+$/, "Login may contain letters, digits, _ and -");

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).optional(),
    login: loginFieldSchema.optional(),
    password: z.string().min(4).optional()
  })
  .refine((payload) => payload.name || payload.login || payload.password, {
    message: "At least one field is required"
  });
