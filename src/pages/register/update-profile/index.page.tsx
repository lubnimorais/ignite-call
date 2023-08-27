import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { SubmitHandler, useForm } from 'react-hook-form';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { ArrowRight } from 'phosphor-react';

import {
  Avatar,
  Button,
  Heading,
  MultiStep,
  Text,
  TextArea,
} from '@ignite-ui/react';
import {
  FormAnnotation,
  ProfileBox,
  UpdateProfileContainer,
  UpdateProfileHeader,
} from './styles';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { buildNextAuthOptions } from '@/pages/api/auth/[...nextauth].api';
import { api } from '@/lib/axios';

const updateProfileFormSchema = zod.object({
  bio: zod.string(),
});

type UpdateProfileFormData = zod.infer<typeof updateProfileFormSchema>;

export default function UpdateProfile() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileFormSchema),
  });

  const session = useSession();

  // FUNCTIONS
  const handleUpdateProfile: SubmitHandler<UpdateProfileFormData> = useCallback(
    async ({ bio }) => {
      await api.put('users/profile', {
        bio,
      });

      await router.push(`/schedule/${session.data?.user.username}`);
    },
    [router, session.data?.user.username],
  );
  // END FUNCTIONS

  return (
    <UpdateProfileContainer>
      <UpdateProfileHeader>
        <Heading as="strong">Bem vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois
        </Text>

        <MultiStep size={4} currentStep={4} />
      </UpdateProfileHeader>

      <ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
        <label>
          <Text size="sm">Foto de perfil</Text>

          <Avatar
            src={session.data?.user.avatar_url}
            alt={session.data?.user.name}
          />
        </label>

        <label>
          <Text size="sm">Sobre você</Text>

          <TextArea {...register('bio')} />
          <FormAnnotation size="sm">
            Fale um pouco sobre você. Isto será exibido em sua página pessoal.
          </FormAnnotation>
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Finalizar
          <ArrowRight />
        </Button>
      </ProfileBox>
    </UpdateProfileContainer>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  );

  return {
    props: {
      session,
    },
  };
};