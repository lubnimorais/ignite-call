import { useCallback } from 'react';

import { Button, TextInput } from '@ignite-ui/react';

import { ArrowRight } from 'phosphor-react';

import { z } from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ClaimUsernameFormContainer, Form } from './styles';

const claimUsernameFormSchema = z.object({
  username: z.string(),
});

interface IClaimUsernameFormData
  extends z.infer<typeof claimUsernameFormSchema> {}

// ou assim
// type IClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>;

const ClaimUsernameForm = () => {
  const { register, handleSubmit } = useForm<IClaimUsernameFormData>({
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
    </ClaimUsernameFormContainer>
  );
};

export { ClaimUsernameForm };
