import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no Prisma, no Node.js built-ins
// Used by middleware.ts (Edge Runtime) and spread into auth.ts (Node.js)
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' as const },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
