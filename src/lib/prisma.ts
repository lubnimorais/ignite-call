import { PrismaClient } from '@prisma/client';

// VAI FAZER O LOG DE TODOS AS SQL's EXECUTADO NO BANCO DE DADOS NO TERMINAL
const prismaClient = new PrismaClient({
  log: ['query'],
});

export { prismaClient };
