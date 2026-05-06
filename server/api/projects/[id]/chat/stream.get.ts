import { createError, getRouterParam, setHeader } from "h3";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "../../../../utils/auth";
import { getProjectWithMembers } from "../../../../utils/project";
import { prisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event);
  const projectId = Number(getRouterParam(event, "id"));
  const project = await getProjectWithMembers(projectId);
  const isAssignedClient = currentUser.role === UserRole.CLIENT && project.members.some((member) => member.userId === currentUser.id);
  const isDeveloperOwner = currentUser.role === UserRole.DEVELOPER && project.createdById === currentUser.id;

  if (!isAssignedClient && !isDeveloperOwner) {
    throw createError({ statusCode: 403, statusMessage: "No access to project chat stream" });
  }

  setHeader(event, "Content-Type", "text/event-stream");
  setHeader(event, "Cache-Control", "no-cache");
  setHeader(event, "Connection", "keep-alive");

  const res = event.node.res;
  res.write(": connected\n\n");

  const sendMessages = async () => {
    const messages = await prisma.chatMessage.findMany({
      where: { projectId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
      take: 100
    });
    res.write(`event: messages\n`);
    res.write(`data: ${JSON.stringify(messages)}\n\n`);
  };

  await sendMessages();
  const interval = setInterval(sendMessages, 2000);

  event.node.req.on("close", () => {
    clearInterval(interval);
    res.end();
  });

  return new Promise(() => {
    // Keep stream open until client disconnects.
  });
});
