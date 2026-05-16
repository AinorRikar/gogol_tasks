/**
 * Загрузка title и favicon с внешнего URL (с ограничениями против SSRF).
 */
const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 120_000;

const blockedHostnames = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

const isPrivateIpv4 = (host: string) => {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
};

export const normalizeExternalUrl = (raw: string) => {
  const trimmed = raw.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are allowed");
  }
  const hostname = url.hostname.toLowerCase();
  if (blockedHostnames.has(hostname) || hostname.endsWith(".local")) {
    throw new Error("URL host is not allowed");
  }
  if (isPrivateIpv4(hostname)) {
    throw new Error("URL host is not allowed");
  }
  return url;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const extractTitle = (html: string, fallback: string) => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (!match?.[1]) return fallback;
  const title = decodeHtmlEntities(match[1]);
  return title || fallback;
};

const extractFaviconHref = (html: string) => {
  const linkTags = html.match(/<link[^>]+>/gi) ?? [];
  const iconTag = linkTags.find((tag) => /rel\s*=\s*["'][^"']*icon/i.test(tag));
  if (!iconTag) return null;
  const hrefMatch = iconTag.match(/href\s*=\s*["']([^"']+)["']/i);
  return hrefMatch?.[1] ?? null;
};

const googleFavicon = (hostname: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;

export const fetchLinkMetadata = async (rawUrl: string) => {
  const url = normalizeExternalUrl(rawUrl);
  const fallbackTitle = url.hostname.replace(/^www\./, "");
  let iconUrl = googleFavicon(url.hostname);

  try {
    const response = await fetch(url.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GogolCRM/1.0; +https://gogol.local)",
        Accept: "text/html,application/xhtml+xml"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { url: url.href, title: fallbackTitle, iconUrl };
    }

    const buffer = await response.arrayBuffer();
    const html = new TextDecoder("utf-8", { fatal: false })
      .decode(buffer.slice(0, MAX_HTML_BYTES))
      .replace(/\0/g, "");

    const title = extractTitle(html, fallbackTitle);
    const faviconHref = extractFaviconHref(html);
    if (faviconHref) {
      try {
        iconUrl = new URL(faviconHref, url.href).href;
      } catch {
        iconUrl = googleFavicon(url.hostname);
      }
    }

    return { url: url.href, title, iconUrl };
  } catch {
    return { url: url.href, title: fallbackTitle, iconUrl };
  }
};
