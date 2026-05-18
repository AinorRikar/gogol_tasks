/** POST /api/auth/logout — удаляет auth-cookie. */
import { clearAuthCookie } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  clearAuthCookie(event);
  return { ok: true };
});
