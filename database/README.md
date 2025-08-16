# MP3 Ninja Database Setup

## Quick Setup Instructions

### 1. Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vgkaiaqhmvoqfbsgityo` 
3. Navigate to **SQL Editor** in the left sidebar

### 2. Run Migration Scripts
Execute these scripts **in order**:

#### Step 1: Create Tables and Schema
```sql
-- Copy and paste the contents of 01_initial_schema.sql
-- This creates: users, songs, user_downloads, admin_actions, friendships tables
```

#### Step 2: Set Up Security Policies  
```sql
-- Copy and paste the contents of 02_row_level_security.sql  
-- This adds RLS policies and auto-user creation trigger
```

#### Step 3: Fix RLS Policy Issues (IMPORTANT!)
```sql
-- Copy and paste the contents of 03_fix_rls_policies.sql
-- This fixes infinite recursion errors in user policies
```

#### Step 4: Fix UPDATE Policy (IMPORTANT!)
```sql
-- Copy and paste the contents of 04_fix_update_policy.sql
-- This fixes the OLD reference error in UPDATE policies
```

#### Step 5: Complete Policy Reset (IF STILL HAVING ISSUES!)
```sql
-- If you're still getting recursion errors, run this complete reset:
-- Copy and paste the contents of 05_complete_policy_reset.sql
-- This completely resets all policies and uses safe functions
```

#### Step 6: Enable Auto-Username Generation (RECOMMENDED!)
```sql
-- Copy and paste the contents of 06_auto_username_generation.sql
-- This auto-generates usernames from email prefixes on first login
-- Examples: john.doe@gmail.com → johndoe, test@example.com → test
```

### 3. Verify Setup
After running the scripts, verify the tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'songs', 'user_downloads', 'admin_actions', 'friendships');
```

### 4. Test Authentication
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `/login`
3. Sign in with Google
4. Check Supabase **Authentication > Users** - you should see the new user
5. Check **Table Editor > users** - you should see the custom user record

## Database Schema Overview

### Core Tables

**users** - Custom user profiles linked to auth.users
- Stores: display_name, username, avatar_url, is_admin, is_banned
- Links to Supabase Auth via foreign key

**songs** - Normalized song metadata (no duplicates)
- Stores: youtube_id, title, artist, duration, thumbnail_url
- One song entry regardless of download count

**user_downloads** - Many-to-many relationship  
- Links users to songs they've downloaded
- Prevents duplicate downloads per user
- Auto-increments song.total_downloads

**friendships** - Social friend system
- Supports: pending, accepted, blocked status
- Bidirectional friend relationships

**admin_actions** - Audit log for admin activities
- Tracks: ban, unban, delete, promote actions
- Links to admin user and target user

### Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **User isolation** - users can only see their own data
✅ **Public profiles** - users can opt into discoverability  
✅ **Friend visibility** - friends can see each other's public downloads
✅ **Admin override** - admins can view/modify all data
✅ **Auto-user creation** - custom user record created on auth signup
✅ **Auto-username generation** - usernames auto-generated from email prefix
✅ **Username uniqueness** - automatic numbering ensures unique usernames

### Performance Optimizations

✅ **Database indexes** on frequently queried columns
✅ **Full-text search** index for song titles/artists
✅ **Automatic triggers** for updated_at timestamps
✅ **Download count** auto-increment on new downloads

## Troubleshooting

### Error: "Could not find table 'public.users'"
- Make sure you ran `01_initial_schema.sql` first
- Check that the script executed without errors
- Verify tables exist in Supabase Table Editor

### Error: "infinite recursion detected in policy for relation 'users'" (PERSISTENT)
- If the error persists after running previous fixes, use the nuclear option:
- Run `05_complete_policy_reset.sql` to completely reset all policies
- This removes ALL existing policies and recreates them safely
- Updates application code to use safe RPC functions instead of direct table access
- Restart your Next.js app after applying the fix

### Error: "missing FROM-clause entry for table 'old'"
- Run `04_fix_update_policy.sql` to fix the UPDATE policy
- This removes incorrect OLD references in INSERT/UPDATE policies
- The OLD keyword only works in UPDATE triggers, not policies

### Error: "RLS policy violation" 
- Make sure you ran all fix scripts: `02_row_level_security.sql`, `03_fix_rls_policies.sql`, and `04_fix_update_policy.sql`
- Check that RLS policies are enabled
- Verify user has proper permissions

### Error: "Function does not exist"
- Ensure UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Check that all functions were created successfully

### Google OAuth Not Working
1. Configure Google OAuth in Supabase Auth settings
2. Add your domain to authorized origins
3. Set redirect URL to: `http://localhost:3000/auth/callback`

## Next Steps

After database setup:
1. ✅ Test user authentication and profile creation
2. 🔲 Implement dashboard page to show user downloads  
3. 🔲 Add YouTube search functionality
4. 🔲 Build download processing system
5. 🔲 Create friend management features
6. 🔲 Implement admin panel for user management