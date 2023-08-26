import { useRouter } from 'next/router';

import { signIn, useSession } from 'next-auth/react';

import { ArrowRight, Check } from 'phosphor-react';

import { Button, Heading, MultiStep, Text } from '@ignite-ui/react';

import { RegisterContainer, RegisterHeader } from '../styles';
import { AuthError, ConnectBox, ConnectItem } from './styles';
import { useCallback } from 'react';

export default function ConnectCalendar() {
  const session = useSession();
  const router = useRouter();

  const hashAuthError = !!router.query.error;
  const isSignedIn = session.status === 'authenticated';

  // FUNCTION
  const handleConnectCalendar = useCallback(async () => {
    await signIn('google');
  }, []);
  // END FUNCTION

  return (
    <RegisterContainer>
      <RegisterHeader>
        <Heading as="strong">Conecte sua agenda</Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </RegisterHeader>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>

          {isSignedIn ? (
            <Button size="sm" disabled>
              Conectado
              <Check />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectCalendar}
            >
              Conectar
              <ArrowRight />
            </Button>
          )}
        </ConnectItem>

        {hashAuthError && (
          <AuthError size="sm">
            Falha ao se conectar ao Google, verifique se você habilitou as
            permissões de acesso ao Google Calendar
          </AuthError>
        )}

        <Button type="submit" disabled={!isSignedIn}>
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </RegisterContainer>
  );
}
