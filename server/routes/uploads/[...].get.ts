import { createReadStream, existsSync } from "node:fs";
import { extname, join } from "node:path";
import { sendStream, createError, getRouterParam, setHeader } from "h3";
import { getUploadsRoot } from "../../utils/uploads";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

/** Отдача загруженных файлов в runtime (prod: UPLOADS_DIR или .output/public/uploads). */
export default defineEventHandler((event) => {
  const relative = getRouterParam(event, "_") || "";
  if (!relative || relative.includes("..")) {
    throw createError({ statusCode: 400, statusMessage: "Invalid path" });
  }

  const filePath = join(getUploadsRoot(), relative);
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: "File not found" });
  }

  const ext = extname(filePath).toLowerCase();
  setHeader(event, "content-type", MIME[ext] || "application/octet-stream");
  setHeader(event, "cache-control", "public, max-age=604800");
  return sendStream(event, createReadStream(filePath));
});
