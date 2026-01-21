-- =============================================
-- F1 APEX - ALL NEW FEATURES SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. STREAK TRACKING (Profile additions)
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_streak INT DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS streak_multiplier DECIMAL DEFAULT 1.0;


-- =============================================
-- 2. PREDICTION TEMPLATES
-- =============================================

CREATE TABLE IF NOT EXISTS prediction_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'standings', 'custom', 'last-race'
    positions JSONB NOT NULL,    -- {"quali_p1": "Driver", "race_p1": "Driver", ...}
    is_global BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prediction_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view global templates"
    ON prediction_templates FOR SELECT
    USING (is_global = true OR user_id = auth.uid());

CREATE POLICY "Users can create own templates"
    ON prediction_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
    ON prediction_templates FOR DELETE
    USING (auth.uid() = user_id);


-- =============================================
-- 3. PREDICTION ANALYTICS
-- =============================================

CREATE TABLE IF NOT EXISTS prediction_analytics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    total_predictions INT DEFAULT 0,
    total_points INT DEFAULT 0,
    correct_p1_count INT DEFAULT 0,
    correct_podium_count INT DEFAULT 0,
    accuracy_by_driver JSONB DEFAULT '{}',
    accuracy_by_circuit JSONB DEFAULT '{}',
    overrated_drivers JSONB DEFAULT '[]',
    underrated_drivers JSONB DEFAULT '[]',
    average_points_per_race DECIMAL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prediction_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
    ON prediction_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can update analytics"
    ON prediction_analytics FOR ALL
    USING (true);


-- =============================================
-- 4. CIRCUIT DATA
-- =============================================

CREATE TABLE IF NOT EXISTS circuit_data (
    id SERIAL PRIMARY KEY,
    race_id INT REFERENCES races(id),
    circuit_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT,
    track_length_km DECIMAL,
    lap_count INT,
    drs_zones INT DEFAULT 2,
    overtaking_difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
    lap_record TEXT,
    lap_record_holder TEXT,
    lap_record_year INT,
    first_gp_year INT,
    weather_patterns JSONB DEFAULT '{}',
    historical_winners JSONB DEFAULT '[]',
    key_corners JSONB DEFAULT '[]',
    track_type TEXT, -- street, permanent, hybrid
    elevation_change_m DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE circuit_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view circuit data"
    ON circuit_data FOR SELECT
    USING (true);


-- =============================================
-- 5. PUSH NOTIFICATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    endpoint TEXT NOT NULL UNIQUE,
    keys JSONB NOT NULL, -- {p256dh, auth}
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
    ON push_subscriptions FOR ALL
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    race_reminders BOOLEAN DEFAULT true,
    friend_requests BOOLEAN DEFAULT true,
    rivalry_updates BOOLEAN DEFAULT true,
    results_announcements BOOLEAN DEFAULT true,
    league_activity BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- =============================================
-- 6. LIVE RACE MODE
-- =============================================

CREATE TABLE IF NOT EXISTS live_sessions (
    id SERIAL PRIMARY KEY,
    race_id INT REFERENCES races(id),
    session_type TEXT NOT NULL, -- 'FP1', 'FP2', 'FP3', 'Qualifying', 'Sprint', 'Race'
    status TEXT DEFAULT 'scheduled', -- scheduled, live, finished, cancelled
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live sessions"
    ON live_sessions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage live sessions"
    ON live_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE TABLE IF NOT EXISTS live_positions (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES live_sessions(id) ON DELETE CASCADE,
    driver TEXT NOT NULL,
    position INT NOT NULL,
    gap_to_leader TEXT,
    interval TEXT,
    last_lap_time TEXT,
    best_lap_time TEXT,
    tire_compound TEXT, -- soft, medium, hard, inter, wet
    tire_age INT DEFAULT 0,
    pit_stops INT DEFAULT 0,
    status TEXT DEFAULT 'running', -- running, pit, out, finished
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live positions"
    ON live_positions FOR SELECT
    USING (true);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_live_positions_session ON live_positions(session_id, position);


-- =============================================
-- 7. FANTASY TEAM MODE
-- =============================================

CREATE TABLE IF NOT EXISTS driver_prices (
    id SERIAL PRIMARY KEY,
    season INT NOT NULL,
    driver TEXT NOT NULL,
    team TEXT NOT NULL,
    price DECIMAL NOT NULL DEFAULT 10.0,
    form_rating DECIMAL DEFAULT 5.0, -- 1-10 current form
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season, driver)
);

ALTER TABLE driver_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view driver prices"
    ON driver_prices FOR SELECT
    USING (true);

CREATE TABLE IF NOT EXISTS fantasy_teams (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    season INT NOT NULL,
    team_name TEXT,
    budget_total DECIMAL DEFAULT 100.0,
    budget_remaining DECIMAL DEFAULT 100.0,
    total_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, season)
);

ALTER TABLE fantasy_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fantasy team"
    ON fantasy_teams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fantasy team"
    ON fantasy_teams FOR ALL
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS fantasy_team_drivers (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    driver TEXT NOT NULL,
    cost DECIMAL NOT NULL,
    is_captain BOOLEAN DEFAULT false,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    race_id INT REFERENCES races(id) -- Race when acquired (for tracking)
);

ALTER TABLE fantasy_team_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own team drivers"
    ON fantasy_team_drivers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM fantasy_teams
            WHERE fantasy_teams.id = fantasy_team_drivers.team_id
            AND fantasy_teams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own team drivers"
    ON fantasy_team_drivers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM fantasy_teams
            WHERE fantasy_teams.id = fantasy_team_drivers.team_id
            AND fantasy_teams.user_id = auth.uid()
        )
    );

CREATE TABLE IF NOT EXISTS fantasy_transfers (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    driver_out TEXT NOT NULL,
    driver_in TEXT NOT NULL,
    cost_difference DECIMAL,
    race_id INT REFERENCES races(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fantasy_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
    ON fantasy_transfers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM fantasy_teams
            WHERE fantasy_teams.id = fantasy_transfers.team_id
            AND fantasy_teams.user_id = auth.uid()
        )
    );


-- =============================================
-- 8. USER PREFERENCES (for Dark Mode etc.)
-- =============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "theme": "dark",
    "notifications": true,
    "publicProfile": true,
    "showStreak": true,
    "compactMode": false
}';


-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_predictions_user_race ON predictions(user_id, race_id);
CREATE INDEX IF NOT EXISTS idx_predictions_points ON predictions(points_total DESC);
CREATE INDEX IF NOT EXISTS idx_fantasy_teams_season ON fantasy_teams(season);
CREATE INDEX IF NOT EXISTS idx_circuit_data_race ON circuit_data(race_id);


-- =============================================
-- INSERT DEFAULT 2026 DRIVER PRICES
-- =============================================

INSERT INTO driver_prices (season, driver, team, price, form_rating) VALUES
(2026, 'Max Verstappen', 'Red Bull', 30.0, 9.5),
(2026, 'Isack Hadjar', 'Red Bull', 8.0, 6.5),
(2026, 'Lando Norris', 'McLaren', 25.0, 9.0),
(2026, 'Oscar Piastri', 'McLaren', 20.0, 8.5),
(2026, 'Charles Leclerc', 'Ferrari', 22.0, 8.5),
(2026, 'Lewis Hamilton', 'Ferrari', 24.0, 8.0),
(2026, 'George Russell', 'Mercedes', 18.0, 8.0),
(2026, 'Kimi Antonelli', 'Mercedes', 10.0, 7.0),
(2026, 'Fernando Alonso', 'Aston Martin', 15.0, 7.5),
(2026, 'Lance Stroll', 'Aston Martin', 8.0, 5.5),
(2026, 'Carlos Sainz', 'Williams', 16.0, 7.5),
(2026, 'Alexander Albon', 'Williams', 12.0, 7.0),
(2026, 'Pierre Gasly', 'Alpine', 10.0, 6.5),
(2026, 'Franco Colapinto', 'Alpine', 6.0, 6.0),
(2026, 'Esteban Ocon', 'Haas', 9.0, 6.0),
(2026, 'Oliver Bearman', 'Haas', 7.0, 6.5),
(2026, 'Yuki Tsunoda', 'RB', 10.0, 7.0),
(2026, 'Liam Lawson', 'RB', 8.0, 6.5),
(2026, 'Nico Hulkenberg', 'Sauber', 8.0, 6.0),
(2026, 'Gabriel Bortoleto', 'Sauber', 5.0, 6.0),
(2026, 'Valtteri Bottas', 'Cadillac', 9.0, 6.0),
(2026, 'Sergio Perez', 'Cadillac', 12.0, 6.0)
ON CONFLICT (season, driver) DO NOTHING;
