import { useCallback } from 'react';

import { Button, Text, TextInput } from '@ignite-ui/react';

import { ArrowRight } from 'phosphor-react';

import { z } from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ClaimUsernameFormContainer, Form, FormAnnotation } from './styles';

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform(username => username.toLowerCase()),
});

interface IClaimUsernameFormData
  extends z.infer<typeof claimUsernameFormSchema> {}

// ou assim
// type IClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>;

const ClaimUsernameForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema),
  });

  // FUNCTIONS
  const handleClaimUsername = useCallback((data: IClaimUsernameFormData) => {
    console.log(data);
  }, []);
  // END FUNCTION

  return (
    <ClaimUsernameFormContainer>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuário"
          {...register('username')}
        />
        <Button type="submit" size="sm">
          Reservar
          <ArrowRight />
        </Button>
      </Form>

      <FormAnnotation>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : 'Digite o nome do usuário desejado'}
        </Text>
      </FormAnnotation>
    </ClaimUsernameFormContainer>
  );
};

export { ClaimUsernameForm };
