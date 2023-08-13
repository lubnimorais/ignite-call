import { NextApiRequest, NextApiResponse } from 'next';

import { Adapter } from 'next-auth/adapters';

import { parseCookies, destroyCookie } from 'nookies';

import { prismaClient } from '../prisma';

export function PrismaAdapter(
  req: NextApiRequest,
  res: NextApiResponse,
): Adapter {
  return {
    async createUser(user) {
      const { '@ignitecall:userId': userIdOnCookies } = parseCookies({ req });

      if (!userIdOnCookies) {
        throw new Error('User ID not found on cookies.');
      }

      const prismaUser = await prismaClient.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      });

      destroyCookie({ res }, '@ignitecall:userId', {
        path: '/',
      });

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email!,
        emailVerified: null,
        username: prismaUser.username,
        avatar_url: prismaUser.avatar_url!,
      };
    },

    async getUser(id) {
      const user = await prismaClient.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!,
      };
    },

    async getUserByEmail(email) {
      const user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      // O findUniqueOrThrow CASO NÃO ENCONTRE, DISPARA UM ERRO
      const account = await prismaClient.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id: providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!account) {
        return null;
      }

      const { user } = account;

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!,
      };
    },

    async updateUser(user) {
      const prismaUser = await prismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      });

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email!,
        emailVerified: null,
        username: prismaUser.username,
        avatar_url: prismaUser.avatar_url!,
      };
    },

    // QUANDO O USUÁRIO LOGA COM UM PROVIDER
    // TINHA UMA CONTA COM O GOOGLE E AGORA ESTÁ LOGANDO COM O GITHUB
    async linkAccount(account) {
      await prismaClient.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      await prismaClient.session.create({
        data: {
          user_id: userId,
          expires,
          session_token: sessionToken,
        },
      });

      return {
        userId,
        expires,
        sessionToken,
      };
    },

    async getSessionAndUser(sessionToken) {
      const prismaSession = await prismaClient.session.findUnique({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      });

      if (!prismaSession) {
        return null;
      }
      const { user, ...session } = prismaSession;

      return {
        session: {
          userId: session.user_id,
          expires: session.expires,
          sessionToken: session.session_token,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email!,
          emailVerified: null,
          username: user.username,
          avatar_url: user.avatar_url!,
        },
      };
    },

    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prismaClient.session.update({
        where: {
          session_token: sessionToken,
        },
        data: {
          expires,
          user_id: userId,
        },
      });

      return {
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
        expires: prismaSession.expires,
      };
    },

    async deleteSession(sessionToken) {
      await prismaClient.session.delete({
        where: {
          session_token: sessionToken,
        },
      });
    },
  };
}
