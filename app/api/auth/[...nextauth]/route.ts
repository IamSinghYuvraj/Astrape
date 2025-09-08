import NextAuth, { type NextAuthOptions, type Session, type DefaultSession } from 'next-auth';
import type { IUser } from '@/models/User';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import type { JWT } from 'next-auth/jwt';

// Rate limiting configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Simple in-memory store for failed login attempts
const failedAttempts = new Map<string, { attempts: number; lastAttempt: number }>();

// Clean up old failed attempts periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (now - value.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 1000); // Run every minute

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const now = Date.now();
        const attempt = failedAttempts.get(credentials.email) || { attempts: 0, lastAttempt: 0 };
        
        // Check if account is temporarily locked
        if (attempt.attempts >= MAX_ATTEMPTS && (now - attempt.lastAttempt) < LOCKOUT_DURATION) {
          const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempt.lastAttempt)) / 60000);
          throw new Error(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
        }

        try {
          await dbConnect();
          const user = await UserModel.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            // Increment failed attempts
            failedAttempts.set(credentials.email, {
              attempts: (attempt.attempts || 0) + 1,
              lastAttempt: now
            });
            throw new Error('Invalid password');
          }

          // Reset failed attempts on successful login
          failedAttempts.delete(credentials.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('An error occurred during authentication');
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };