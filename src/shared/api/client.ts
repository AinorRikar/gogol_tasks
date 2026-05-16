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
  const mePath = withAppBase("/api/auth/me");

  const fetchMe = async (): Promise<User | null> => {
    try {
      if (import.meta.server) {
        // При SSR обычный $fetch не передаёт Cookie браузера — сессия пропадала после F5.
        const requestFetch = useRequestFetch();
        return await requestFetch<User>(mePath);
      }
      return await $fetch<User>(mePath, { credentials: "include" });
    } catch {
      return null;
    }
  };

  if (import.meta.client) {
    currentUser.value = await fetchMe();
    return;
  }

  if (!currentUser.value) {
    currentUser.value = await fetchMe();
  }
};

export const useApi = async <T>(path: string, options: Record<string, unknown> = {}) => {
  return $fetch<T>(withAppBase(path), {
    ...options,
    credentials: "include"
  });
};
