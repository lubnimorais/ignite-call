import { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import dayjs from 'dayjs';

import { CaretLeft, CaretRight } from 'phosphor-react';

import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles';

import { getWeekDay } from '@/utils/get-week-days';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface ICalendarWeek {
  week: number;
  days: Array<{
    date: dayjs.Dayjs;
    disabled: boolean;
  }>;
}

type CalendarWeeks = ICalendarWeek[];

interface IBlockedDates {
  blockedWeekDays: number[];
}

interface ICalendarProps {
  selectedDate: Date | null;
  onDateSelected: (date: Date) => void;
}

export function Calendar({ selectedDate, onDateSelected }: ICalendarProps) {
  const router = useRouter();

  const username = String(router.query.username);

  const [currentDate, setCurrentDate] = useState(() => {
    // setando o dia 1
    return dayjs().set('date', 1);
  });

  const shortWeekDays = getWeekDay({ short: true });

  const currentMonth = currentDate.format('MMMM');
  const currentYear = currentDate.format('YYYY');

  // USE QUERY
  const { data: blockedDates } = useQuery<IBlockedDates>(
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    async () => {
      const response = await api.get(`/users/${username}/blocked-date`, {
        params: {
          year: currentDate.get('year'),
          month: currentDate.get('month'),
        },
      });

      return response.data;
    },
  );
  // END USE QUERY

  // MEMO
  const calendarWeeks = useMemo(() => {
    // QUANTOS DIAS EXISTE NO MÊS ATUAL
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, index) => {
      return currentDate.set('date', index + 1);
    });

    // DIAS DO MÊS ANTERIOR
    const firstWeekDay = currentDate.get('day');

    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, index) => {
        return currentDate.subtract(index + 1, 'day');
      })
      .reverse(); // REVERTE O ARRAY
    // -------

    // DIAS DO PRÓXIMO MÊS
    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    );
    const lastWeekDay = lastDayInCurrentMonth.get('day');

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, index) => {
      return lastDayInCurrentMonth.add(index + 1, 'day');
    });
    // -------

    const calendarDays = [
      ...previousMonthFillArray.map(date => {
        return {
          date,
          disabled: true,
        };
      }),
      ...daysInMonthArray.map(date => {
        return {
          date,
          disabled:
            date.endOf('day').isBefore(new Date()) ||
            blockedDates?.blockedWeekDays.includes(date.get('day')),
        };
      }),
      ...nextMonthFillArray.map(date => {
        return {
          date,
          disabled: true,
        };
      }),
    ];

    // DIVIDIR OS DIAS EM SEMANAS
    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, index, calendarWeeksOriginal) => {
        const isNewWeek = index % 7 === 0;

        if (isNewWeek) {
          weeks.push({
            week: index / 7 + 1,
            days: calendarWeeksOriginal.slice(index, index + 7),
          });
        }

        return weeks;
      },
      [],
    );

    return calendarWeeks;
  }, [currentDate, blockedDates]);
  // END MEMO

  // FUNCTIONS
  const handlePreviousMonth = useCallback(() => {
    const previousMonthDate = currentDate.subtract(1, 'month');

    setCurrentDate(previousMonthDate);
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    const nextMonthDate = currentDate.add(1, 'month');

    setCurrentDate(nextMonthDate);
  }, [currentDate]);
  // END FUNCTIONS

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft />
          </button>

          <button onClick={handleNextMonth} title="Next month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map(weekDay => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        disabled={disabled}
                        onClick={() => onDateSelected(date.toDate())}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  );
}
