import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { githubVerifiedProfile } from './github-profile'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      userinfo: { request: githubVerifiedProfile },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-posta ve şifre gereklidir')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('Geçersiz e-posta veya şifre')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Geçersiz e-posta veya şifre')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/giris',
    error: '/giris',
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Canonical account linking stays with PrismaAdapter. A Google email is
      // accepted only after the provider explicitly verifies its ownership.
      if (account?.provider === 'google') return profile?.email_verified === true
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        if (typeof user.id !== 'string' || !user.id) throw new Error('SESSION_ID_UNVERIFIED')
        token.id = user.id
        token.role = (user as any).role
      }

      // The browser may request a refresh, but cannot supply identity/role
      // claims. Read permitted profile fields from the already-issued account.
      if (trigger === 'update') {
        if (typeof token.id !== 'string' || !token.id) throw new Error('SESSION_ID_UNVERIFIED')
        const actor = await prisma.user.findUnique({
          where: { id: token.id },
          select: { id: true, name: true, email: true, image: true, role: true },
        })
        if (!actor) throw new Error('SESSION_ACTOR_UNAVAILABLE')
        token.name = actor.name
        token.email = actor.email
        token.picture = actor.image
        token.role = actor.role
      }

      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
      }
      return session
    },
  },
})
