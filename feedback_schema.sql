-- =============================================
-- FEEDBACK TABLE
-- For storing contact form submissions
-- =============================================

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    name TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can insert feedback (no auth required for contact form)
CREATE POLICY "Anyone can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (true);

-- Only admins can view all feedback
CREATE POLICY "Admins can view all feedback"
    ON feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Only admins can update feedback status
CREATE POLICY "Admins can update feedback"
    ON feedback FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Index for faster admin queries
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- =============================================
-- FUTURE: NOTIFICATION PREFERENCES
-- Uncomment when implementing push notifications
-- =============================================

-- CREATE TABLE IF NOT EXISTS notification_preferences (
--     user_id UUID PRIMARY KEY REFERENCES auth.users(id),
--     race_reminders BOOLEAN DEFAULT true,
--     friend_requests BOOLEAN DEFAULT true,
--     rivalry_updates BOOLEAN DEFAULT true,
--     results_announcements BOOLEAN DEFAULT true,
--     weekly_digest BOOLEAN DEFAULT false,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own preferences"
--     ON notification_preferences FOR SELECT
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update own preferences"
--     ON notification_preferences FOR UPDATE
--     USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own preferences"
--     ON notification_preferences FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
