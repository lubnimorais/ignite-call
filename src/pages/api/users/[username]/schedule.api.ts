import { NextApiRequest, NextApiResponse } from 'next';

import { z as zod } from 'zod';

import { prismaClient } from '@/lib/prisma';

import dayjs from 'dayjs';
import { google } from 'googleapis';
import { getGoogleOAuthToken } from '@/lib/google';

const createSchedulingBodySchema = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  observations: zod.string(),
  date: zod.string().datetime(),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const username = String(req.query.username);

  const user = await prismaClient.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' });
  }

  const { name, email, observations, date } = createSchedulingBodySchema.parse(
    req.body,
  );

  const schedulingDate = dayjs(date).startOf('hour');

  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({
      message: 'Date is in the past.',
    });
  }

  const conflictScheduling = await prismaClient.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  });

  if (conflictScheduling) {
    return res.status(400).json({
      message: 'There is another scheduling at the same time',
    });
  }

  const scheduling = await prismaClient.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id,
    },
  });

  // CHAMANDO A API DO CALENDAR
  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  });

  await calendar.events.insert({
    calendarId: 'primary', // pega o calendário default (principal)
    conferenceDataVersion: 1, // precisa enviar 1 para criar o Google Meet
    // precisa ter todas as informações do evento
    requestBody: {
      summary: `Ignite Call: ${name}`, // tipo do evento
      description: observations,
      // horário de início
      start: {
        dateTime: schedulingDate.format(), // assim já formata no formato ISO
      },
      // horário de término vai ser sempre uma hora após o horário de início
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      // quem vai estar convidado para o evento
      attendees: [{ email, displayName: name }],
      // criar o avento com uma chamada do Google Meet
      conferenceData: {
        // cria a chamada no Google Meet no momento que for criado o evento
        createRequest: {
          requestId: scheduling.id, // pode ser qualquer coisa, mas sendo único
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  });

  return res.status(201).end();
}
