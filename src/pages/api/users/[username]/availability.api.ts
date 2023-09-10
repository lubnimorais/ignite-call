import { NextApiRequest, NextApiResponse } from 'next';

import { prismaClient } from '@/lib/prisma';

import dayjs from 'dayjs';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const username = String(req.query.username);
  const { date } = req.query;

  if (!date) {
    res.status(400).json({ message: 'Date not provider' });
  }

  const user = await prismaClient.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' });
  }

  const referenceDate = dayjs(String(date));

  // VALIDAR SE É UMA DATA QUE JÁ PASSOU, NÃO TER NENHUM HORÁRIO DISPONÍVEL
  const isPastDate = referenceDate.endOf('day').isBefore(new Date());

  if (isPastDate) {
    return res.json({ possibleTimes: [], availability: [] });
  }

  /**
   * Fazer um cruzando com intervalo de tempo que o usuário selecionou que tem disponibilidade
   * com os agendamentos
   */

  const userAvailability = await prismaClient.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  });

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availability: [] });
  }

  const { time_start_in_minutes, time_end_in_minutes } = userAvailability;

  /**
   * Como na aplicação está sendo determinado que o agendamento é de hora em hora
   * então podemos dividir por 60.
   * Caso não fosse, não poderíamos estar fazendo essa divisão, pois geraria números
   * quebrados
   */
  const startHour = time_start_in_minutes / 60;
  const endHour = time_end_in_minutes / 60;

  // CRIAR ARRAY COM TODAS AS HORAS "DISPONÍVEIS"
  // SE FOSSE DE 15 EM 15 MINUTOS, PEGARIA E MULTIPLICARIA OU DIVIDIRIA POR 4 (15, 30, 45, 60)
  const possibleTimes = Array.from({
    length: endHour - startHour,
  }).map((_, index) => {
    return startHour + index;
  });

  // PROCURAR POR TODOS AGENDAMENTOS MARCADOS POR QUALQUER USUÁRIO
  // NO DIA ESPECÍFICO QUE ESTAMOS BUSCANDO

  // gte -> greater than or equal (maior que ou igual)
  // lte -> menor que ou igual
  const blockedTimes = await prismaClient.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  });

  // PEGAR OS HORÁRIOS DISPONÍVEIS E VALIDADE QUE NÃO EXISTE AGENDAMENTO NO HORÁRIO

  const availableTimes = possibleTimes.filter(time => {
    // manter apenas quando não existe
    const isTimeBlocked = !blockedTimes.some(
      blockedTime => blockedTime.date.getHours() === time,
    );

    // verifica horário se já passou
    const isTimeInPast = referenceDate.set('hour', time).isBefore(new Date());

    return !isTimeBlocked && !isTimeInPast;
  });

  return res.json({ possibleTimes, availableTimes });
}
