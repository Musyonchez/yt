import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  google_id: string;
  display_name: string;
  username?: string;
  avatar_url?: string;
  is_public: boolean;
  is_admin: boolean;
  is_banned: boolean;
  banned_at?: string;
  banned_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail_url: string;
  view_count: number;
  total_downloads: number;
  created_at: string;
}

export interface UserDownload {
  id: string;
  user_id: string;
  song_id: string;
  downloaded_at: string;
}

// User management functions for hybrid auth approach
export const createOrUpdateUser = async (authUser: any) => {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      email: authUser.email,
      google_id: authUser.user_metadata?.sub,
      display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user:', error);
    return { error };
  }

  return { data };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { error };
  }

  return { data };
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return { error };
  }

  return { data };
};

export const checkUsernameAvailable = async (username: string, excludeUserId?: string) => {
  let query = supabase
    .from('users')
    .select('id')
    .eq('username', username);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking username:', error);
    return { error };
  }

  return { available: data.length === 0 };
};