-- =================================================================
-- DATABASE FLUSH SCRIPT
-- WARNING: THIS WILL DELETE ALL USERS AND DATA!
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new
-- =================================================================

BEGIN;

-- 1. CLEAN UP PUBLIC TABLES FIRST (Reverse dependency order)
-- We do this explicitly because some constraints might effectively block the cascade

-- 1. CLEAN UP PUBLIC TABLES FIRST (Reverse dependency order)
-- We check for existence to avoid errors if tables are missing

DO $$ BEGIN
    -- Level 3: Deep dependencies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'league_members') THEN DELETE FROM public.league_members; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'league_invites') THEN DELETE FROM public.league_invites; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fantasy_team_drivers') THEN DELETE FROM public.fantasy_team_drivers; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fantasy_transfers') THEN DELETE FROM public.fantasy_transfers; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'live_positions') THEN DELETE FROM public.live_positions; END IF;

    -- Level 2: Direct profile dependencies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'predictions') THEN DELETE FROM public.predictions; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fantasy_teams') THEN DELETE FROM public.fantasy_teams; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leagues') THEN DELETE FROM public.leagues; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_preferences') THEN DELETE FROM public.notification_preferences; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'push_subscriptions') THEN DELETE FROM public.push_subscriptions; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feedback') THEN DELETE FROM public.feedback; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_achievements') THEN DELETE FROM public.user_achievements; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_feed') THEN DELETE FROM public.activity_feed; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friendships') THEN DELETE FROM public.friendships; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prediction_templates') THEN DELETE FROM public.prediction_templates WHERE is_global = false; END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prediction_analytics') THEN DELETE FROM public.prediction_analytics; END IF;

    -- Level 1: The Profiles themselves
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN DELETE FROM public.profiles; END IF;
END $$;

-- 2. NOW delete all users from the auth system
DELETE FROM auth.users;

-- 3. Optional: Clean up any orphaned data (just in case)

COMMIT;

-- 3. Verify emptiness
SELECT COUNT(*) as remaining_users FROM auth.users;
SELECT COUNT(*) as remaining_profiles FROM public.profiles;
