import { getHeader, type H3Event } from "h3";

/**
 * Относительный путь (/uploads/...) → абсолютный URL для браузера и Integration API.
 * PUBLIC_APP_ORIGIN — публичный origin без пути (http://IP или https://domain), обязателен,
 * если API дергают из Docker-сети (иначе в URL попадёт gogol-dashboard:3000).
 */
export const toPublicAssetUrl = (event: H3Event, fileUrl: string) => {
  if (!fileUrl) return fileUrl;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const appBase = (process.env.NUXT_PUBLIC_APP_BASEURL || "/").replace(/\/+$/, "");
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  const pathname = appBase ? `${appBase}${path}` : path;

  const configuredOrigin = process.env.PUBLIC_APP_ORIGIN?.replace(/\/+$/, "");
  if (configuredOrigin) {
    return `${configuredOrigin}${pathname}`;
  }

  const proto =
    getHeader(event, "x-forwarded-proto")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const host =
    getHeader(event, "x-forwarded-host")?.split(",")[0]?.trim() || getHeader(event, "host");
  if (!host) return fileUrl;

  return `${proto}://${host}${pathname}`;
};
