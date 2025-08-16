-- Add automatic username generation from email prefix
-- Run this to enable auto-username generation on user creation

-- Update the safe_upsert_user function to include username generation
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
    email_prefix TEXT;
    generated_username TEXT;
    username_counter INTEGER := 0;
BEGIN
    -- Extract email prefix for username (part before @)
    email_prefix := LOWER(SPLIT_PART(user_email, '@', 1));
    
    -- Clean up the username (remove dots, plus signs, etc. - keep only alphanumeric and underscore)
    email_prefix := REGEXP_REPLACE(email_prefix, '[^a-z0-9_]', '', 'g');
    
    -- Ensure username is not empty and has minimum length
    IF LENGTH(email_prefix) < 3 THEN
        email_prefix := 'user' || TO_CHAR(EXTRACT(EPOCH FROM NOW())::INTEGER, 'FM999999999');
    END IF;
    
    -- Limit username length to 20 characters
    IF LENGTH(email_prefix) > 20 THEN
        email_prefix := LEFT(email_prefix, 20);
    END IF;
    
    generated_username := email_prefix;
    
    -- Check if username already exists and generate unique one by adding numbers
    WHILE EXISTS (SELECT 1 FROM users WHERE username = generated_username AND id != user_id) LOOP
        username_counter := username_counter + 1;
        -- Ensure total length doesn't exceed 20 characters
        generated_username := LEFT(email_prefix, 18) || username_counter::TEXT;
    END LOOP;
    
    -- Use INSERT ... ON CONFLICT with explicit fields to avoid RLS issues
    INSERT INTO users (
        id, 
        email, 
        display_name, 
        avatar_url, 
        google_id,
        username,
        created_at,
        updated_at
    ) 
    VALUES (
        user_id,
        user_email,
        user_display_name,
        user_avatar_url,
        user_google_id,
        generated_username,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        google_id = COALESCE(EXCLUDED.google_id, users.google_id),
        -- Only set username if it's currently NULL (preserve user changes)
        username = COALESCE(users.username, EXCLUDED.username),
        updated_at = NOW()
    RETURNING * INTO result_user;
    
    RETURN result_user;
END;
$$;

-- Example username transformations:
-- john.doe@gmail.com → johndoe
-- test+user@example.com → testuser  
-- a@domain.com → user[timestamp] (too short)
-- very.long.email.address@domain.com → verylongemailaddres (truncated to 20 chars)
-- If johndoe exists: johndoe1, johndoe2, etc.