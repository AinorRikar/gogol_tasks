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

  const fetchMe = async (): Promise<User | null> => {
    try {
      return await useApi<User>("/api/auth/me");
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

/**
 * SSR: пробрасываем Cookie текущего запроса (иначе после F5 сессия «теряется» на внутренних API-вызовах).
 * Клиент: credentials: "include".
 */
export const useApi = async <T>(path: string, options: Record<string, unknown> = {}) => {
  const url = withAppBase(path);

  if (import.meta.server) {
    const incoming = useRequestHeaders(["cookie"]);
    const cookie = incoming.cookie;
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...((options.headers as Record<string, string> | undefined) ?? {}),
        ...(cookie ? { cookie } : {})
      }
    });
  }

  return $fetch<T>(url, {
    ...options,
    credentials: "include"
  });
};
