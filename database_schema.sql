-- FL-Predictor Database Schema
-- Run this in your Supabase SQL Editor

-- ====================================================
-- 1. PROFILES TABLE (User Information)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    total_score INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ====================================================
-- 2. RACES TABLE (F1 Race Calendar)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.races (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    circuit TEXT NOT NULL,
    quali_time TIMESTAMP WITH TIME ZONE,
    race_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sprint BOOLEAN DEFAULT false,
    previous_winner TEXT,
    track_condition TEXT,
    forecast TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (for migrations)
DO $$ 
BEGIN
    -- Add is_sprint column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'races' 
                   AND column_name = 'is_sprint') THEN
        ALTER TABLE public.races ADD COLUMN is_sprint BOOLEAN DEFAULT false;
    END IF;
    
    -- Add previous_winner column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'races' 
                   AND column_name = 'previous_winner') THEN
        ALTER TABLE public.races ADD COLUMN previous_winner TEXT;
    END IF;
    
    -- Add track_condition column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'races' 
                   AND column_name = 'track_condition') THEN
        ALTER TABLE public.races ADD COLUMN track_condition TEXT;
    END IF;
    
    -- Add forecast column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'races' 
                   AND column_name = 'forecast') THEN
        ALTER TABLE public.races ADD COLUMN forecast TEXT;
    END IF;
    
    -- Add quali_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'races' 
                   AND column_name = 'quali_time') THEN
        ALTER TABLE public.races ADD COLUMN quali_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add is_admin to profiles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read races (use IF NOT EXISTS pattern)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'races' 
        AND policyname = 'Races are viewable by everyone'
    ) THEN
        CREATE POLICY "Races are viewable by everyone"
            ON public.races FOR SELECT
            USING (true);
    END IF;
END $$;

-- ====================================================
-- 3. PREDICTIONS TABLE (User Predictions)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.predictions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    race_id INTEGER NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
    
    -- Qualifying Predictions
    quali_p1_driver TEXT,
    quali_p2_driver TEXT,
    quali_p3_driver TEXT,
    
    -- Race Predictions
    race_p1_driver TEXT,
    race_p2_driver TEXT,
    race_p3_driver TEXT,
    
    -- Subjective Predictions
    wild_prediction TEXT,
    biggest_flop TEXT,
    biggest_surprise TEXT,
    
    -- Scoring
    points_total INTEGER DEFAULT 0,
    manual_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one prediction per user per race
    UNIQUE(user_id, race_id)
);

-- Enable Row Level Security
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all predictions"
    ON public.predictions FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own predictions"
    ON public.predictions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
    ON public.predictions FOR UPDATE
    USING (auth.uid() = user_id);

-- ====================================================
-- 4. INDEXES (Performance Optimization)
-- ====================================================
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_race_id ON public.predictions(race_id);
CREATE INDEX IF NOT EXISTS idx_races_race_time ON public.races(race_time);

-- ====================================================
-- 5. OFFICIAL 2026 F1 CALENDAR (24 Races)
-- Race times are approximate (UTC) - adjust for actual broadcast times
-- ====================================================

-- Clear old race data first (WARNING: This deletes all existing races and their predictions!)
-- Comment out these lines if you want to keep existing data
DELETE FROM public.predictions WHERE race_id IN (SELECT id FROM public.races WHERE race_time < '2026-01-01');
DELETE FROM public.races WHERE race_time < '2026-01-01';

INSERT INTO public.races (name, circuit, quali_time, race_time, is_sprint) VALUES
    -- OFFICIAL 2026 F1 CALENDAR - Times in UTC
    -- Quali times are Saturday, Race times are Sunday (except noted)
    
    -- Round 1: Australia - Quali 16:00 local = 05:00 UTC, Race 16:00 local = 04:00 UTC (DST)
    ('Australian Grand Prix', 'Albert Park Circuit, Melbourne', '2026-03-07 05:00:00+00', '2026-03-08 04:00:00+00', false),
    
    -- Round 2: China (Sprint) - Quali 15:00 local = 07:00 UTC
    ('Chinese Grand Prix', 'Shanghai International Circuit', '2026-03-14 07:00:00+00', '2026-03-15 07:00:00+00', true),
    
    -- Round 3: Japan - Quali 15:00 local = 06:00 UTC
    ('Japanese Grand Prix', 'Suzuka International Racing Course', '2026-03-28 06:00:00+00', '2026-03-29 05:00:00+00', false),
    
    -- Round 4: Bahrain - Quali 19:00 local = 16:00 UTC
    ('Bahrain Grand Prix', 'Bahrain International Circuit', '2026-04-11 16:00:00+00', '2026-04-12 15:00:00+00', false),
    
    -- Round 5: Saudi Arabia - Quali 20:00 local = 17:00 UTC
    ('Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2026-04-18 17:00:00+00', '2026-04-19 17:00:00+00', false),
    
    -- Round 6: Miami (Sprint) - Quali 16:00 local = 20:00 UTC
    ('Miami Grand Prix', 'Miami International Autodrome', '2026-05-02 20:00:00+00', '2026-05-03 20:00:00+00', true),
    
    -- Round 7: Canada (Sprint) - Quali 16:00 local = 20:00 UTC
    ('Canadian Grand Prix', 'Circuit Gilles Villeneuve, Montreal', '2026-05-23 20:00:00+00', '2026-05-24 20:00:00+00', true),
    
    -- Round 8: Monaco - Quali 16:00 local = 14:00 UTC
    ('Monaco Grand Prix', 'Circuit de Monaco', '2026-06-06 14:00:00+00', '2026-06-07 13:00:00+00', false),
    
    -- Round 9: Spain (Barcelona) - Quali 16:00 local = 14:00 UTC
    ('Spanish Grand Prix', 'Circuit de Barcelona-Catalunya', '2026-06-13 14:00:00+00', '2026-06-14 13:00:00+00', false),
    
    -- Round 10: Austria - Quali 16:00 local = 14:00 UTC
    ('Austrian Grand Prix', 'Red Bull Ring, Spielberg', '2026-06-27 14:00:00+00', '2026-06-28 13:00:00+00', false),
    
    -- Round 11: Great Britain (Sprint) - Quali 16:00 local = 15:00 UTC
    ('British Grand Prix', 'Silverstone Circuit', '2026-07-04 15:00:00+00', '2026-07-05 14:00:00+00', true),
    
    -- Round 12: Belgium - Quali 16:00 local = 14:00 UTC
    ('Belgian Grand Prix', 'Circuit de Spa-Francorchamps', '2026-07-18 14:00:00+00', '2026-07-19 13:00:00+00', false),
    
    -- Round 13: Hungary - Quali 16:00 local = 14:00 UTC
    ('Hungarian Grand Prix', 'Hungaroring, Budapest', '2026-07-25 14:00:00+00', '2026-07-26 13:00:00+00', false),
    
    -- Round 14: Netherlands (Sprint) - Quali 16:00 local = 14:00 UTC
    ('Dutch Grand Prix', 'Circuit Zandvoort', '2026-08-22 14:00:00+00', '2026-08-23 13:00:00+00', true),
    
    -- Round 15: Italy (Monza) - Quali 16:00 local = 14:00 UTC
    ('Italian Grand Prix', 'Autodromo Nazionale di Monza', '2026-09-05 14:00:00+00', '2026-09-06 13:00:00+00', false),
    
    -- Round 16: Madrid (NEW) - Quali 16:00 local = 14:00 UTC
    ('Madrid Grand Prix', 'Madrid Street Circuit', '2026-09-12 14:00:00+00', '2026-09-13 13:00:00+00', false),
    
    -- Round 17: Azerbaijan (Saturday Race) - Quali 16:00 local = 12:00 UTC
    ('Azerbaijan Grand Prix', 'Baku City Circuit', '2026-09-25 12:00:00+00', '2026-09-26 11:00:00+00', false),
    
    -- Round 18: Singapore (Sprint) - Quali 21:00 local = 13:00 UTC
    ('Singapore Grand Prix', 'Marina Bay Street Circuit', '2026-10-10 13:00:00+00', '2026-10-11 12:00:00+00', true),
    
    -- Round 19: United States (Austin) - Quali 16:00 local = 21:00 UTC
    ('United States Grand Prix', 'Circuit of the Americas, Austin', '2026-10-24 21:00:00+00', '2026-10-25 20:00:00+00', false),
    
    -- Round 20: Mexico - Quali 15:00 local = 21:00 UTC
    ('Mexico City Grand Prix', 'Autódromo Hermanos Rodríguez', '2026-10-31 21:00:00+00', '2026-11-01 20:00:00+00', false),
    
    -- Round 21: Brazil (São Paulo) - Quali 15:00 local = 18:00 UTC
    ('Brazilian Grand Prix', 'Autódromo José Carlos Pace, São Paulo', '2026-11-07 18:00:00+00', '2026-11-08 17:00:00+00', false),
    
    -- Round 22: Las Vegas (Saturday Night) - Quali 20:00 local = 04:00 UTC (next day)
    ('Las Vegas Grand Prix', 'Las Vegas Strip Circuit', '2026-11-21 04:00:00+00', '2026-11-22 04:00:00+00', false),
    
    -- Round 23: Qatar - Quali 21:00 local = 18:00 UTC
    ('Qatar Grand Prix', 'Lusail International Circuit', '2026-11-28 18:00:00+00', '2026-11-29 16:00:00+00', false),
    
    -- Round 24: Abu Dhabi (Season Finale) - Quali 18:00 local = 14:00 UTC
    ('Abu Dhabi Grand Prix', 'Yas Marina Circuit', '2026-12-05 14:00:00+00', '2026-12-06 13:00:00+00', false)
ON CONFLICT DO NOTHING;

-- ====================================================
-- 6. FUNCTIONS & TRIGGERS (Auto-create profile on signup)
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- DONE! Your database is ready for FL-Predictor 🏎️
-- ====================================================
