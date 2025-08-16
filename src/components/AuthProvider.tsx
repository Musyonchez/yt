'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase, User as CustomUser, createOrUpdateUser, getUserProfile } from '@/lib/supabase';

interface AuthContextType {
  authUser: AuthUser | null;
  user: CustomUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (authUser) {
      const { data } = await getUserProfile(authUser.id);
      setUser(data);
    }
  };

  const handleAuthUser = async (authUser: AuthUser | null) => {
    setAuthUser(authUser);
    
    if (authUser) {
      // Create or update custom user record
      const { data: updatedUser } = await createOrUpdateUser(authUser);
      setUser(updatedUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}