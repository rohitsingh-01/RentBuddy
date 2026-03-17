import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Dev credentials login ────────────────────────────────────────────────
    // Works with any email in development — no email server needed.
    // In production set NODE_ENV=production to disable this.
    ...(process.env.NODE_ENV !== 'production'
      ? [
          CredentialsProvider({
            id: 'dev-credentials',
            name: 'Dev login (local only)',
            credentials: {
              email: { label: 'Email', type: 'email', placeholder: 'demo@iitb.ac.in' },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null
              await connectDB()

              // Find or create user automatically
              let user = await User.findOne({ email: credentials.email.toLowerCase() })
              if (!user) {
                user = await User.create({
                  name: credentials.email.split('@')[0],
                  email: credentials.email.toLowerCase(),
                  universityEmail: credentials.email.toLowerCase(),
                  universityName: getUniversityFromEmail(credentials.email),
                  isVerified: isEduEmail(credentials.email),
                  onboardingComplete: false,
                  profile: { budget: { min: 0, max: 50000 }, lifestyle: {} },
                })
              }

              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
              }
            },
          }),
        ]
      : []),

    // ── Google OAuth ────────────────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Magic link email ────────────────────────────────────────────────────
    ...(process.env.EMAIL_SERVER
      ? [
          EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM || 'noreply@rentbuddy.app',
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectDB()
        const email = user.email?.toLowerCase()
        if (!email) return false

        const existing = await User.findOne({ email })
        if (!existing) {
          await User.create({
            name: user.name || email.split('@')[0],
            email,
            image: user.image,
            universityEmail: email,
            universityName: getUniversityFromEmail(email),
            isVerified: isEduEmail(email),
            onboardingComplete: false,
            profile: { budget: { min: 0, max: 50000 }, lifestyle: {} },
          })
        }
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    async session({ session }) {
      if (session?.user?.email) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: session.user.email }).lean() as any
          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser._id.toString(),
              isVerified: dbUser.isVerified,
              rentItsSignedUp: dbUser.rentItsSignedUp,
              universityName: dbUser.universityName,
              onboardingComplete: dbUser.onboardingComplete ?? false,
            } as any
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },

    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after sign-in (unless going somewhere specific)
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/dashboard`
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',

  debug: process.env.NODE_ENV === 'development',
}

function isEduEmail(email: string): boolean {
  const eduDomains = ['.edu', '.ac.in', '.edu.in', '.ac.uk', '.edu.au', '.ac.nz']
  return eduDomains.some((d) => email.includes(d))
}

function getUniversityFromEmail(email: string): string | undefined {
  const domain = email.split('@')[1]
  if (!domain) return undefined
  const parts = domain.split('.')
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' University'
  }
  return undefined
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      isVerified?: boolean
      rentItsSignedUp?: boolean
      universityName?: string
      onboardingComplete?: boolean
    }
  }
}
