import { ProjectStatus } from "@prisma/client";
import { readBody } from "h3";
import { z } from "zod";
import { assertDeveloper, getCurrentUser } from "../../utils/auth";
import { prisma } from "../../utils/prisma";

const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  status: z.nativeEnum(ProjectStatus),
  visibility: z.boolean(),
  hidden: z.boolean().default(false),
  useForPortfolio: z.boolean().default(false),
  techStack: z.string().max(4000).default("")
});

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  assertDeveloper(currentUser);

  const payload = createProjectSchema.parse(await readBody(event));
  return prisma.project.create({
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      visibility: payload.visibility,
      hidden: payload.hidden,
      useForPortfolio: payload.useForPortfolio,
      techStack: payload.techStack,
      createdById: currentUser.id
    }
  });
});
