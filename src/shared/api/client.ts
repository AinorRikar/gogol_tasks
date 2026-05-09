/**
 * Клиент API с cookie-сессией: все $fetch с credentials: "include", чтобы JWT из httpOnly-cookie
 * уходил на Nitro. useState("current-user") — один источник правды для текущего пользователя (SSR + клиент).
 */
import type { User } from "~/shared/types";

/** Префикс для $fetch/EventSource при деплое под /dashboard/ (NUXT_PUBLIC_APP_BASEURL). */
export const withAppBase = (path: string): string => {
  const config = useRuntimeConfig();
  const raw = (config.public.appBaseURL as string) || "/";
  const base = raw.replace(/\/+$/, "");
  if (!path.startsWith("/")) return base ? `${base}/${path}` : path;
  return base ? `${base}${path}` : path;
};

export const useCurrentUser = () => useState<User | null>("current-user", () => null);

export const useInitActiveUser = async () => {
  const currentUser = useCurrentUser();
  if (currentUser.value) return;
  try {
    currentUser.value = await $fetch<User>(withAppBase("/api/auth/me"), {
      credentials: "include"
    });
  } catch {
    currentUser.value = null;
  }
};

export const useApi = async <T>(path: string, options: Record<string, unknown> = {}) => {
  return $fetch<T>(withAppBase(path), {
    ...options,
    credentials: "include"
  });
};
