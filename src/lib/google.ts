import { google } from 'googleapis';
import { prismaClient } from './prisma';
import dayjs from 'dayjs';

async function getGoogleOAuthToken(userId: string) {
  const account = await prismaClient.account.findFirstOrThrow({
    where: {
      provider: 'google',
      user_id: userId,
    },
  });

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  // AUTENTICAR NA API DO GOOGLE
  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  });

  if (!account.expires_at) {
    return auth;
  }

  // VERIFICAR SE PRECISA ATUALIZAR O ACCESS TOKEN
  /**
   * expires_at é salvo em Epoch, em segundos
   * Mas para o dayjs, precisa ser em milesegundos por isso multiplica com 1000
   */
  const isTokenExpired = dayjs(account.expires_at * 1000).isBefore(new Date());

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken();
    const {
      access_token,
      refresh_token,
      expiry_date,
      id_token,
      scope,
      token_type,
    } = credentials;

    await prismaClient.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token,
        refresh_token,
        expires_at: expiry_date ? Math.floor(expiry_date / 1000) : null,
        id_token,
        scope,
        token_type,
      },
    });

    auth.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    });
  }

  return auth;
}

export { getGoogleOAuthToken };
