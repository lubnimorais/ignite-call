import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';

import NextAuth, { NextAuthOptions } from 'next-auth';

import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google';

import { PrismaAdapter } from '@/lib/auth/PrismaAdapter';

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    // Configure one or more authentication providers
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        authorization: {
          params: {
            scope:
              'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar',
          },
        },
        // profile -> exatamente o que o Google retorna, quando faz login
        // serve para mapear os campos internos do NextAuth com o perfil retornado do Google
        profile: (profile: GoogleProfile) => {
          return {
            // sub - identifica o usuário unicamente
            id: profile.sub,
            name: profile.name,
            username: '',
            email: profile.email,
            avatar_url: profile.picture,
          };
        },
      }),
      // ...add more providers here
    ],
    callbacks: {
      async signIn({ account }) {
        if (
          !account?.scope?.includes('https://www.googleapis.com/auth/calendar')
        ) {
          return '/register/connect-calendar/?error=permissions';
        }

        return true;
      },

      async session({ session, user }) {
        return {
          ...session,
          user,
        };
      },
    },
  };
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, buildNextAuthOptions(req, res));
}
