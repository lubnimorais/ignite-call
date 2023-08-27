import { useCallback } from 'react';

import { useRouter } from 'next/router';

import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react';

import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { z as zod } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowRight } from 'phosphor-react';

import { getWeekDay } from '@/utils/get-week-days';
import { convertTimeStringToMinutes } from '@/utils/convert-time-string-to-minutes';

import {
  Container,
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalHeader,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles';
import { api } from '@/lib/axios';

const timeIntervalsFormSchema = zod.object({
  intervals: zod
    .array(
      zod.object({
        weekDay: zod.number().min(0).max(6),
        enabled: zod.boolean(),
        startTime: zod.string(),
        endTime: zod.string(),
      }),
    )
    .length(7)
    .transform(intervals => intervals.filter(interval => interval.enabled))
    .refine(intervals => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana!',
    })
    .transform(intervals => {
      return intervals.map(interval => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        };
      });
    })
    .refine(
      intervals => {
        return intervals.every(
          interval =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        );
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início',
      },
    ),
});

type TimeIntervalsFormInputs = zod.input<typeof timeIntervalsFormSchema>;

// faz a mesma coisa que o infer, mas é mais semântico de ler
type TimeIntervalsFormOutput = zod.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
  const router = useRouter();

  // HOOK FORM
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TimeIntervalsFormInputs>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  });

  const { fields } = useFieldArray({
    name: 'intervals',
    control,
  });

  const intervals = watch('intervals');
  // END HOOK FORM

  const weekDays = getWeekDay();

  // FUNCTION
  const handleSetTimeIntervals: SubmitHandler<any> = useCallback(
    async data => {
      const { intervals } = data as TimeIntervalsFormOutput;

      await api.post('/users/time-intervals', { intervals });

      await router.push('/register/update-profile');
    },
    [router],
  );
  // END FUNCTION

  return (
    <Container>
      <IntervalHeader>
        <Heading as="strong">Quase lá!</Heading>
        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </IntervalHeader>

      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
        <IntervalsContainer>
          {fields.map((fieldInput, index) => (
            <IntervalItem key={fieldInput.id}>
              <IntervalDay>
                <Controller
                  name={`intervals.${index}.enabled`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      onCheckedChange={checked => {
                        field.onChange(checked === true);
                      }}
                      checked={field.value}
                    />
                  )}
                />

                <Text>{weekDays[fieldInput.weekDay]}</Text>
              </IntervalDay>

              <IntervalInputs>
                {/* Quando se tem input de horário, podemos definir o intervalo que */}
                {/* o horário seja selecionado */}
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={intervals[index].enabled === false}
                  {...register(`intervals.${index}.startTime`)}
                />

                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  disabled={intervals[index].enabled === false}
                  {...register(`intervals.${index}.endTime`)}
                />
              </IntervalInputs>
            </IntervalItem>
          ))}
        </IntervalsContainer>

        {errors.intervals && (
          <FormError size="sm">{errors.intervals.message}</FormError>
        )}

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}
