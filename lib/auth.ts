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
      // The signIn callback below requires Google to own the verified address
      // before PrismaAdapter can link it to an existing password account.
      allowDangerousEmailAccountLinking: true,
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
      if (account?.provider === 'google') {
        const email = profile?.email
        if (profile?.email_verified !== true || typeof email !== 'string' ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false

        // Auth.js verifies Google's signed OIDC claims before this callback.
        // Google owns Gmail addresses and Workspace addresses with an hd claim.
        // A third-party email marked verified can have changed owners since
        // Google first checked it, so it must not auto-link an existing account.
        return email.toLowerCase().endsWith('@gmail.com') ||
          (typeof profile.hd === 'string' && profile.hd.trim().length > 0)
      }
      return true
    },
    async jwt({ token, user }) {
      // Eski sürümde istemci token.sub dahil bütün kimlik alanlarını değiştirebiliyordu.
      // Yalnız yeni, sunucuda doğrulanmış girişler sürüm 2 oturumu başlatabilir.
      if (user) {
        if (typeof user.id !== 'string' || !user.id) throw new Error('SESSION_ID_UNVERIFIED')
      } else if (token.authVersion !== 2) {
        return null
      }

      const id = user ? user.id : token.sub
      if (typeof id !== 'string' || !id) return null
      const account = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, name: true, email: true, image: true },
      })
      if (!account) return null

      // Güncelleme gövdesi kimlik/rol kaynağı değildir; profil de veritabanından okunur.
      token.id = account.id
      token.sub = account.id
      token.role = account.role
      token.name = account.name
      token.email = account.email
      token.picture = account.image
      token.authVersion = 2
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
