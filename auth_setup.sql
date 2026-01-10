-- ====================================================
-- FL-Predictor Authentication Configuration for Supabase
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ====================================================

-- NOTE: Most authentication settings are configured in the Supabase Dashboard
-- under Authentication -> Settings. This file provides additional database
-- setup and functions to support the authentication flow.

-- ====================================================
-- 1. ENSURE PROFILES TABLE EXISTS WITH PROPER STRUCTURE
-- ====================================================
-- This should already exist from database_schema.sql, but ensure is_admin is present

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ====================================================
-- 2. AUTO-CREATE PROFILE ON USER SIGNUP
-- ====================================================
-- This function creates a profile entry when a new user signs up
-- The profile is linked to auth.users and stores username + admin status

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, total_score, is_admin)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        0,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it's up to date
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- 3. FUNCTION TO CHECK IF USER IS ADMIN
-- ====================================================
-- Used by frontend to verify admin access

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- 4. GRANT AN ADMIN USER (Replace with your email)
-- ====================================================
-- Run this AFTER signing up to make yourself an admin
-- Replace 'your-email@example.com' with your actual email

-- UPDATE public.profiles 
-- SET is_admin = true 
-- WHERE username = 'your-email@example.com';

-- Or use user ID directly:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'your-user-uuid-here';

-- ====================================================
-- 5. ROW LEVEL SECURITY FOR PREDICTIONS
-- ====================================================
-- Ensure users can only modify their own predictions

-- Users can view all predictions (for transparency board)
CREATE POLICY IF NOT EXISTS "Anyone can view predictions"
    ON public.predictions FOR SELECT
    USING (true);

-- Users can only insert their own predictions
CREATE POLICY IF NOT EXISTS "Users can insert own predictions"
    ON public.predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own predictions
CREATE POLICY IF NOT EXISTS "Users can update own predictions"
    ON public.predictions FOR UPDATE
    USING (auth.uid() = user_id);

-- ====================================================
-- SUPABASE DASHBOARD CONFIGURATION REQUIRED
-- ====================================================
-- The following settings need to be configured in the Supabase Dashboard
-- (they cannot be set via SQL):

/*
AUTHENTICATION -> URL CONFIGURATION:
-------------------------------------
1. Site URL: https://your-production-domain.com
   (for local dev: http://localhost:3000)

2. Redirect URLs (add all of these):
   - http://localhost:3000/auth/callback
   - http://localhost:3000/reset-password
   - https://your-production-domain.com/auth/callback
   - https://your-production-domain.com/reset-password

AUTHENTICATION -> EMAIL TEMPLATES:
-----------------------------------
1. Confirm signup: 
   Subject: "Confirm your F1 Predictor account"
   
2. Magic Link:
   Subject: "Your F1 Predictor Magic Link"
   
3. Reset Password:
   Subject: "Reset your F1 Predictor password"
   Redirect URL: {{ .RedirectTo }}

AUTHENTICATION -> PROVIDERS:
----------------------------
1. Email: ENABLED
   - Confirm email: Optional (can disable for easier testing)
   - Secure email change: Recommended ON

AUTHENTICATION -> RATE LIMITS:
------------------------------
1. Email OTPs: 30 per hour (default)
2. Token refresh: 300 per hour (default)
*/

-- ====================================================
-- 6. VERIFY SETUP
-- ====================================================
-- Run this to verify everything is set up correctly:

SELECT 
    'Profiles table' as check_item,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) as status;

SELECT 
    'is_admin column' as check_item,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) as status;

SELECT 
    'handle_new_user trigger' as check_item,
    EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) as status;

-- ====================================================
-- DONE! Your Supabase auth is configured for:
-- ✅ Email/Password signup & login
-- ✅ Magic Link (OTP) authentication  
-- ✅ Password reset flow
-- ✅ Admin role management
-- ====================================================
