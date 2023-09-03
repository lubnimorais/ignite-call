import { useCallback } from 'react';

import { Button, Text, TextArea, TextInput } from '@ignite-ui/react';

import { useForm, SubmitHandler } from 'react-hook-form';

import { z as zod } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { CalendarBlank, Clock } from 'phosphor-react';

import { ConfirmForm, FormActions, FormError, FormHeader } from './styles';

const confirmFormSchema = zod.object({
  name: zod
    .string()
    .min(3, { message: 'O nome precisa de no mínimo 3 caracteres' }),
  email: zod.string().email({ message: 'Digite um e-mail válido' }),
  observations: zod.string().nullable(),
});

type ConfirmFormData = zod.infer<typeof confirmFormSchema>;

const ConfirmStep = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  });

  const handleConfirmScheduling: SubmitHandler<ConfirmFormData> = useCallback(
    async ({ name, email, observations }) => {
      console.log({ name, email, observations });
    },
    [],
  );

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          02 de setembro de 2023
        </Text>

        <Text>
          <Clock />
          16:25
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
        <Button type="button" variant="tertiary">
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
