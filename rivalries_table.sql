-- ============================================
-- Rivalries Table for Head-to-Head Feature
-- Run in Supabase SQL Editor
-- ============================================

-- Create rivalries table
CREATE TABLE IF NOT EXISTS public.rivalries (
    id SERIAL PRIMARY KEY,
    challenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenger_name TEXT NOT NULL,
    opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opponent_name TEXT NOT NULL,
    challenger_driver TEXT NOT NULL,
    opponent_driver TEXT,
    race_duration INTEGER DEFAULT 3, -- Number of races
    races_completed INTEGER DEFAULT 0,
    challenger_points INTEGER DEFAULT 0,
    opponent_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, active, completed, declined
    winner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all rivalries
CREATE POLICY "Rivalries are viewable by everyone"
    ON public.rivalries FOR SELECT
    USING (true);

-- Policy: Users can create rivalries where they are the challenger
CREATE POLICY "Users can create rivalries as challenger"
    ON public.rivalries FOR INSERT
    WITH CHECK (auth.uid() = challenger_id);

-- Policy: Users can update rivalries they are part of
CREATE POLICY "Users can update own rivalries"
    ON public.rivalries FOR UPDATE
    USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rivalries_challenger ON public.rivalries(challenger_id);
CREATE INDEX IF NOT EXISTS idx_rivalries_opponent ON public.rivalries(opponent_id);
CREATE INDEX IF NOT EXISTS idx_rivalries_status ON public.rivalries(status);

-- Function to update rivalry points when predictions are scored
CREATE OR REPLACE FUNCTION update_rivalry_points()
RETURNS TRIGGER AS $$
DECLARE
    rivalry_record RECORD;
BEGIN
    -- Find active rivalries for this user
    FOR rivalry_record IN 
        SELECT * FROM public.rivalries 
        WHERE status = 'active' 
        AND (challenger_id = NEW.user_id OR opponent_id = NEW.user_id)
    LOOP
        -- Update points for the appropriate side
        IF rivalry_record.challenger_id = NEW.user_id THEN
            UPDATE public.rivalries 
            SET challenger_points = challenger_points + NEW.points_earned
            WHERE id = rivalry_record.id;
        ELSE
            UPDATE public.rivalries 
            SET opponent_points = opponent_points + NEW.points_earned
            WHERE id = rivalry_record.id;
        END IF;
        
        -- Increment races completed
        UPDATE public.rivalries 
        SET races_completed = races_completed + 1
        WHERE id = rivalry_record.id;
        
        -- Check if rivalry is complete
        UPDATE public.rivalries 
        SET 
            status = 'completed',
            ended_at = NOW(),
            winner_id = CASE 
                WHEN challenger_points > opponent_points THEN challenger_id
                WHEN opponent_points > challenger_points THEN opponent_id
                ELSE NULL -- Tie
            END
        WHERE id = rivalry_record.id 
        AND races_completed >= race_duration;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment: Trigger would be created on predictions table when scores are updated
-- CREATE TRIGGER rivalry_points_trigger
--     AFTER UPDATE OF points_earned ON public.predictions
--     FOR EACH ROW
--     EXECUTE FUNCTION update_rivalry_points();
