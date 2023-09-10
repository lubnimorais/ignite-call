import { useCallback, useState } from 'react';

import dayjs from 'dayjs';

import { Calendar } from '@/components/Calendar';

import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles';
import { api } from '@/lib/axios';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

interface IAvailability {
  // todos os horários possíveis
  possibleTimes: number[];
  // horários disponíveis
  availableTimes: number[];
}

interface ICalendarStepProps {
  onSelectDateTime: (date: Date) => void;
}

export function CalendarStep({ onSelectDateTime }: ICalendarStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [availability, setAvailability] = useState<IAvailability | null>(null);

  const router = useRouter();

  const username = String(router.query.username);

  const isDateSelected = !!selectedDate;

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null;
  const describeDate = selectedDate
    ? dayjs(selectedDate).format('DD[ de ]MMMM')
    : null;

  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null;

  const { data: availability } = useQuery<IAvailability>(
    ['availability', selectedDateWithoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        params: {
          date: selectedDateWithoutTime,
        },
      });

      return response.data;
    },
    {
      enabled: !!selectedDate,
    },
  );

  // FUNCTIONS
  const handleSelectTime = useCallback(
    (hour: number) => {
      // startOf -> começo da hora, coloca minutos, segundos, milésimos com 0
      const dateWithTime = dayjs(selectedDate)
        .set('hour', hour)
        .startOf('hour')
        .toDate();

      onSelectDateTime(dateWithTime);
    },
    [selectedDate, onSelectDateTime],
  );
  // END FUNCTIONS

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describeDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map(hour => {
              return (
                <TimePickerItem
                  key={hour}
                  disabled={!availability.availableTimes.includes(hour)}
                  onClick={() => {
                    handleSelectTime(hour);
                  }}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              );
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  );
}
