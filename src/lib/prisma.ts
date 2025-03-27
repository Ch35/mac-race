import { PrismaClient } from "@prisma/client";

const prismaClient = () => {
  return new PrismaClient();
}

type prismaClient = ReturnType<typeof prismaClient>;

const globalForPrisma = global as unknown as { prisma: prismaClient | undefined };

export const prisma = globalForPrisma.prisma || prismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma