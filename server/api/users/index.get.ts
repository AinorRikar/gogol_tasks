import { prisma } from "../../utils/prisma";

export default defineEventHandler(async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });
});
