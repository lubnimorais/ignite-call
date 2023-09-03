import { useCallback, useMemo, useState } from 'react';

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

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    // setando o dia 1
    return dayjs().set('date', 1);
  });

  const shortWeekDays = getWeekDay({ short: true });

  const currentMonth = currentDate.format('MMMM');
  const currentYear = currentDate.format('YYYY');

  // MEMO
  const calendarWeeks = useMemo(() => {
    // QUANTOS DIAS EXISTE NO MÊS ATUAL
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, index) => {
      return currentDate.set('date', index + 1);
    });

    const firstWeekDay = currentDate.get('day');

    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, index) => {
        return currentDate.subtract(index + 1, 'day');
      })
      .reverse(); // REVERTE O ARRAY

    return [...previousMonthFillArray, ...daysInMonthArray];
  }, [currentDate]);
  // END MEMO

  console.log(calendarWeeks);

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
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <CalendarDay>1</CalendarDay>
            </td>
            <td>
              <CalendarDay>2</CalendarDay>
            </td>
            <td>
              <CalendarDay>3</CalendarDay>
            </td>
          </tr>
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  );
}
