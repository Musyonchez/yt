-- Complete reset of users table policies to fix persistent recursion
-- Run this to completely remove and recreate all policies safely

-- 1. Disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on users table
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON users';
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, non-recursive policies

-- Policy 1: Users can read their own profile
CREATE POLICY "users_own_profile" ON users
    FOR ALL 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 2: Allow reading public profiles (exclude own profile to avoid recursion)
CREATE POLICY "users_public_profiles" ON users
    FOR SELECT 
    USING (
        is_public = true 
        AND NOT is_banned 
        AND auth.uid() IS NOT NULL
        AND auth.uid() != id
    );

-- Policy 3: Service role has full access (for triggers and functions)
CREATE POLICY "users_service_role" ON users
    FOR ALL 
    USING (auth.role() = 'service_role');

-- Policy 4: Allow initial insert (for user creation)
CREATE POLICY "users_insert_new" ON users
    FOR INSERT 
    WITH CHECK (
        auth.uid() = id 
        AND auth.uid() IS NOT NULL
    );

-- 5. Create a safe upsert function that bypasses RLS issues
CREATE OR REPLACE FUNCTION safe_upsert_user(
    user_id UUID,
    user_email TEXT,
    user_display_name TEXT DEFAULT NULL,
    user_avatar_url TEXT DEFAULT NULL,
    user_google_id TEXT DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_user users;
BEGIN
    -- Use INSERT ... ON CONFLICT with explicit fields to avoid RLS issues
    INSERT INTO users (
        id, 
        email, 
        display_name, 
        avatar_url, 
        google_id,
        created_at,
        updated_at
    ) 
    VALUES (
        user_id,
        user_email,
        user_display_name,
        user_avatar_url,
        user_google_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        google_id = COALESCE(EXCLUDED.google_id, users.google_id),
        updated_at = NOW()
    RETURNING * INTO result_user;
    
    RETURN result_user;
END;
$$;

-- 6. Update the auto-user creation trigger to use the safe function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM safe_upsert_user(
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'sub'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION safe_upsert_user TO authenticated;
GRANT EXECUTE ON FUNCTION safe_upsert_user TO service_role;