-- MP3 Ninja - Cleanup Script
-- WARNING: This will delete ALL data except users table
-- Run this in your Supabase SQL Editor

-- Drop all tables except users (in correct order to handle foreign keys)

-- 1. Drop tables that reference other tables first
DROP TABLE IF EXISTS user_downloads CASCADE;
DROP TABLE IF EXISTS user_songs CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- 2. Drop the songs table (referenced by user_downloads and user_songs)
DROP TABLE IF EXISTS songs CASCADE;

-- Note: We keep the users table intact
-- users table remains untouched with all user data

-- Verify what tables remain:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';