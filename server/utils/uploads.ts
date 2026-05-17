import { join } from "node:path";

/** Каталог загрузок: в prod по умолчанию `.output/public/uploads` (отдаёт Nitro), в Docker — `UPLOADS_DIR`. */
export const getUploadsRoot = () => {
  if (process.env.UPLOADS_DIR) {
    return process.env.UPLOADS_DIR.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return join(process.cwd(), ".output/public/uploads");
  }
  return join(process.cwd(), "public/uploads");
};

export const getProjectUploadsDir = () => join(getUploadsRoot(), "projects");

/** Публичный префикс URL загрузок с учётом NUXT_PUBLIC_APP_BASEURL. */
export const uploadsPublicBasePath = () => {
  const appBase = (process.env.NUXT_PUBLIC_APP_BASEURL || "/").replace(/\/+$/, "");
  return appBase ? `${appBase}/uploads` : "/uploads";
};
