/**
 * GET /api/auth/me — текущий пользователь по cookie.
 */
import { getCurrentUser } from "../../utils/auth";
import { toPublicUser } from "../../utils/user";

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event);
  return toPublicUser(user);
});
