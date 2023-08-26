import { useCallback } from 'react';

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
  FormSubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { z as zod } from 'zod';

import { ArrowRight } from 'phosphor-react';

import {
  Container,
  IntervalBox,
  IntervalDay,
  IntervalHeader,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles';
import { getWeekDay } from '@/utils/get-week-days';

const timeIntervalsFormSchema = zod.object({
  name: zod.string(),
});

export default function TimeIntervals() {
  // HOOK FORM
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
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
  const handleSetTimeIntervals: FormSubmitHandler =
    useCallback(async () => {}, []);
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

        <Button type="submit">
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}
