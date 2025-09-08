'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return {
    user: session?.user,
    status,
    signOut,
    isAuthenticated: !!session,
  };
}
