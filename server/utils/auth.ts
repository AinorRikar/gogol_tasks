import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { UserRole, type User } from "@prisma/client";
import { createError, getCookie, setCookie, deleteCookie, type H3Event } from "h3";
import { prisma } from "./prisma";

const AUTH_COOKIE = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const comparedHash = scryptSync(password, salt, 64);
  const originalHash = Buffer.from(hash, "hex");
  return originalHash.length === comparedHash.length && timingSafeEqual(originalHash, comparedHash);
};

export const signAuth = (userId: number) =>
  jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d"
  });

export const setAuthCookie = (event: H3Event, token: string) => {
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
};

export const clearAuthCookie = (event: H3Event) => {
  deleteCookie(event, AUTH_COOKIE, {
    path: "/"
  });
};

export const getCurrentUser = async (event: H3Event): Promise<User> => {
  const token = getCookie(event, AUTH_COOKIE);
  if (!token) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const targetUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!targetUser) throw createError({ statusCode: 401, statusMessage: "User not found" });
    return targetUser;
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid auth token" });
  }
};

export const getCurrentUserOptional = async (event: H3Event): Promise<User | null> => {
  const token = getCookie(event, AUTH_COOKIE);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const targetUser = await prisma.user.findUnique({ where: { id: payload.userId } });
    return targetUser ?? null;
  } catch {
    return null;
  }
};

export const assertDeveloper = (user: User) => {
  if (user.role !== UserRole.DEVELOPER) {
    throw createError({ statusCode: 403, statusMessage: "Only developer can perform this action" });
  }
};
