import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { Button, Text, TextArea, TextInput } from '@ignite-ui/react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { z as zod } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { CalendarBlank, Clock } from 'phosphor-react';

import { ConfirmForm, FormActions, FormError, FormHeader } from './styles';
import dayjs from 'dayjs';
import { api } from '@/lib/axios';

const confirmFormSchema = zod.object({
  name: zod
    .string()
    .min(3, { message: 'O nome precisa de no mínimo 3 caracteres' }),
  email: zod.string().email({ message: 'Digite um e-mail válido' }),
  observations: zod.string().nullable(),
});

type ConfirmFormData = zod.infer<typeof confirmFormSchema>;

interface IConfirmStepProps {
  schedulingDate: Date;
  onCancelConfirmation: () => void;
}

const ConfirmStep = ({
  schedulingDate,
  onCancelConfirmation,
}: IConfirmStepProps) => {
  const router = useRouter();

  const username = String(router.query.username);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  });

  const describedDate = dayjs(schedulingDate).format('DD[ de ]MMMM[ de ]YYYY');
  const describedTime = dayjs(schedulingDate).format('HH[:]mm[h]');

  // FUNCTIONS
  const handleConfirmScheduling: SubmitHandler<ConfirmFormData> = useCallback(
    async ({ name, email, observations }) => {
      await api.post(`/users/${username}/schedule`, {
        name,
        email,
        observations,
        date: schedulingDate,
      });

      onCancelConfirmation();
    },
    [schedulingDate, username, onCancelConfirmation],
  );
  // END FUNCTIONS

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {describedDate}
        </Text>

        <Text>
          <Clock />
          {describedTime}
        </Text>
      </FormHeader>

      <label>
        <Text size="sm">Nome completo</Text>
        <TextInput placeholder="Seu nome" {...register('name')} />
        {errors.name && <FormError size="sm">{errors.name.message}</FormError>}
      </label>

      <label>
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput
          type="email"
          placeholder="johndoe@example.com"
          {...register('email')}
        />
        {errors.email && (
          <FormError size="sm">{errors.email.message}</FormError>
        )}
      </label>

      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register('observations')} />
      </label>

      <FormActions>
        <Button type="button" variant="tertiary" onClick={onCancelConfirmation}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Confirmar
        </Button>
      </FormActions>
    </ConfirmForm>
  );
};

export { ConfirmStep };
