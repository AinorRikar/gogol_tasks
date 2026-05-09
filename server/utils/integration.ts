/**
 * Доступ MySite к узкому read-only API: JWT в Authorization: Bearer … или X-Site-Token.
 * Подпись HS256 тем же секретом, что INTEGRATION_SECRET в .env у дашборда и MySite (выдаётся только сервером MySite).
 */
import jwt from "jsonwebtoken";
import { createError, getHeader, type H3Event } from "h3";

export const assertSiteIntegrationToken = (event: H3Event) => {
  const secret = process.env.INTEGRATION_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: "INTEGRATION_SECRET is not set on dashboard"
    });
  }

  const authz = getHeader(event, "authorization");
  const headerToken = getHeader(event, "x-site-token");
  const raw =
    headerToken?.trim() ||
    (authz?.startsWith("Bearer ") ? authz.slice("Bearer ".length).trim() : undefined);

  if (!raw) {
    throw createError({ statusCode: 401, statusMessage: "Missing integration token" });
  }

  try {
    jwt.verify(raw, secret, { algorithms: ["HS256"], maxAge: "3m" });
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid integration token" });
  }
};
