/**
 * Клиент API с cookie-сессией: все $fetch с credentials: "include", чтобы JWT из httpOnly-cookie
 * уходил на Nitro. useState("current-user") — один источник правды для текущего пользователя (SSR + клиент).
 */
import type { User } from "~/shared/types";

export const useCurrentUser = () => useState<User | null>("current-user", () => null);

export const useInitActiveUser = async () => {
  const currentUser = useCurrentUser();
  if (currentUser.value) return;
  try {
    currentUser.value = await $fetch<User>("/api/auth/me", {
      credentials: "include"
    });
  } catch {
    currentUser.value = null;
  }
};

export const useApi = async <T>(path: string, options: Record<string, unknown> = {}) => {
  return $fetch<T>(path, {
    ...options,
    credentials: "include"
  });
};
