/**
 * Сериализация проекта для Integration API (портфолио на внешнем сайте).
 * Включает описания, медиа, ссылки, справочные блоки; маскировка hidden — как у гостя в CRM.
 */
import type { H3Event } from "h3";
import { toPublicAssetUrl } from "./assetUrl";
import { buildProjectAccessContext, serializeProjectListItem } from "./projectSerializer";

type PortfolioProject = {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  version: string;
  status: string;
  visibility: boolean;
  hidden: boolean;
  useForPortfolio: boolean;
  techStack: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{ user: { id: number; name: string } }>;
  images: Array<{ id: number; fileName: string; fileUrl: string; mimeType: string }>;
  links: Array<{ id: number; url: string; title: string; iconUrl: string }>;
  referenceBlocks: Array<{ id: number; title: string; content: string; order: number }>;
};

export const serializePortfolioProject = (event: H3Event, project: PortfolioProject) => {
  const ctx = buildProjectAccessContext(project, null);
  const base = serializeProjectListItem(project, ctx);

  return {
    id: base.id,
    title: base.title,
    shortDescription: base.shortDescription ?? "",
    fullDescription: ctx.isHiddenForViewer ? "" : project.fullDescription,
    version: base.version ?? "",
    status: project.status,
    visibility: project.visibility,
    hidden: project.hidden,
    useForPortfolio: project.useForPortfolio,
    techStack: base.techStack,
    archivedAt: project.archivedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    referenceBlocks: ctx.isHiddenForViewer
      ? []
      : project.referenceBlocks.map((block) => ({
          id: block.id,
          title: block.title,
          content: block.content,
          order: block.order
        })),
    images: ctx.isHiddenForViewer
      ? []
      : project.images.map((image) => ({
          id: image.id,
          fileName: image.fileName,
          fileUrl: toPublicAssetUrl(event, image.fileUrl),
          mimeType: image.mimeType
        })),
    links: ctx.isHiddenForViewer
      ? []
      : project.links.map((link) => ({
          id: link.id,
          url: link.url,
          title: link.title,
          iconUrl: link.iconUrl
        })),
    members: base.members
  };
};

export const portfolioProjectInclude = {
  members: { include: { user: true } },
  images: { orderBy: { createdAt: "desc" as const } },
  links: { orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }] },
  referenceBlocks: { orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }] }
};
