import { NextApiRequest, NextApiResponse } from 'next';

import { getServerSession } from 'next-auth/next';

import { buildNextAuthOptions } from '../auth/[...nextauth].api';
import { z as zod } from 'zod';
import { prismaClient } from '@/lib/prisma';

const updateProfileBodySchema = zod.object({
  bio: zod.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  );

  if (!session) {
    return res.status(401).end();
  }

  const { bio } = updateProfileBodySchema.parse(req.body);

  await prismaClient.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      bio,
    },
  });

  // 204 - Sucesso mais sem conteúdo
  return res.status(204).end();
}
