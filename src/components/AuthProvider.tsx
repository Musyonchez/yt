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
  const [initializing, setInitializing] = useState(true);

  const refreshUser = async () => {
    if (authUser) {
      try {
        const { data } = await getUserProfile(authUser.id);
        setUser(data);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const handleAuthUser = async (authUser: AuthUser | null, skipUserCreation = false) => {
    setAuthUser(authUser);
    
    if (authUser && !skipUserCreation) {
      try {
        // Create or update custom user record with error handling
        const { data: updatedUser, error } = await createOrUpdateUser(authUser);
        if (error) {
          console.error('Failed to create/update user:', error);
          // Still set user data from auth if available
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            google_id: authUser.user_metadata?.sub || '',
            display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'User',
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
            is_public: true,
            is_admin: false,
            is_banned: false,
            created_at: authUser.created_at,
            updated_at: authUser.updated_at || authUser.created_at
          });
        } else {
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error in handleAuthUser:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await handleAuthUser(session?.user ?? null);
          setInitializing(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setInitializing(false);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted && !initializing) {
          try {
            // Skip user creation for initial load to prevent duplicate calls
            const skipCreation = event === 'INITIAL_SESSION';
            await handleAuthUser(session?.user ?? null, skipCreation);
            setLoading(false);
          } catch (error) {
            console.error('Error in auth state change:', error);
            if (mounted) {
              setLoading(false);
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializing]);

  return (
    <AuthContext.Provider value={{ authUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}