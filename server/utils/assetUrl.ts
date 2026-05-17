import { getHeader, type H3Event } from "h3";

/** Относительный путь загрузки → абсолютный URL для Integration API и внешних клиентов. */
export const toPublicAssetUrl = (event: H3Event, fileUrl: string) => {
  if (!fileUrl) return fileUrl;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const proto = getHeader(event, "x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  const host = getHeader(event, "host");
  if (!host) return fileUrl;

  const base = (process.env.NUXT_PUBLIC_APP_BASEURL || "/dashboard/").replace(/\/+$/, "");
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  const prefix = base ? `${base}${path}` : path;
  return `${proto}://${host}${prefix}`;
};
