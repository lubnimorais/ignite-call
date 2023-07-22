import { prismaClient } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

import { setCookie } from 'nookies';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') {
    // 405 - method not allowed
    // .end() - termina a resposta sem nenhum corpo
    return response.status(405).end();
  }

  const { name, username } = request.body;

  const userExists = await prismaClient.user.findUnique({
    where: { username },
  });

  if (userExists) {
    return response.status(400).json({
      message: 'Username already taken',
    });
  }

  const user = await prismaClient.user.create({
    data: {
      name,
      username,
    },
  });

  // maxAge: minuto * hora * dia * quantidade de dias
  setCookie({ res: response }, '@ignitecall:userId', user.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response.status(201).json({ user });
}
