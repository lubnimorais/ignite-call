import { useCallback, useEffect } from 'react';

import { useRouter } from 'next/router';

import { NextSeo } from 'next-seo';

import { api } from '@/lib/axios';
import { AxiosError } from 'axios';

import { SubmitHandler, useForm } from 'react-hook-form';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowRight } from 'phosphor-react';

import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react';

import {
  FormError,
  RegisterContainer,
  RegisterForm,
  RegisterHeader,
} from './styles';

const registerFormSchema = zod.object({
  username: zod
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform(username => username.toLowerCase()),
  name: zod.string().min(3, 'O nome precisa ter pelo menos 3 letras'),
});

type RegisterFormData = zod.infer<typeof registerFormSchema>;

export default function Register() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  // FUNCTIONS
  const handleRegister: SubmitHandler<RegisterFormData> = useCallback(
    async ({ username, name }) => {
      try {
        await api.post('/users', {
          name,
          username,
        });

        await router.push('/register/connect-calendar');
      } catch (err) {
        if (err instanceof AxiosError && err.response?.data.message) {
          alert(err.response.data.message);

          return;
        }

        console.log(err);
      }
    },
    [router],
  );
  // END FUNCTIONS

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username));
    }
  }, [router.query?.username, setValue]);

  return (
    <>
      <NextSeo title="Crie uma conta | Ignite Call" />

      <RegisterContainer>
        <RegisterHeader>
          <Heading as="strong">Bem vindo ao Ignite Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois
          </Text>

          <MultiStep size={4} currentStep={1} />
        </RegisterHeader>

        <RegisterForm as="form" onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size="sm">Nome de usuário</Text>

            <TextInput
              prefix="ignite.com/"
              placeholder="seu-usuario"
              {...register('username')}
            />

            {errors.username && (
              <FormError size="sm">{errors.username.message}</FormError>
            )}
          </label>

          <label>
            <Text size="sm">Nome completo</Text>

            <TextInput placeholder="Seu nome" {...register('name')} />

            {errors.name && (
              <FormError size="sm">{errors.name.message}</FormError>
            )}
          </label>

          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </RegisterForm>
      </RegisterContainer>
    </>
  );
}
