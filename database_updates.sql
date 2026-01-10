-- ============================================
-- FL-Predictor 2026 Complete Database Update
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. REMOVE DUPLICATE RACES
-- ============================================
DELETE FROM races
WHERE id NOT IN (
    SELECT MIN(id)
    FROM races
    GROUP BY name
);

-- ============================================
-- 2. ADD SESSION TIMING COLUMNS
-- ============================================
ALTER TABLE races ADD COLUMN IF NOT EXISTS fp1_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE races ADD COLUMN IF NOT EXISTS fp2_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE races ADD COLUMN IF NOT EXISTS fp3_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE races ADD COLUMN IF NOT EXISTS sprint_quali_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE races ADD COLUMN IF NOT EXISTS sprint_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE races ADD COLUMN IF NOT EXISTS is_sprint_weekend BOOLEAN DEFAULT FALSE;

-- ============================================
-- 3. COMPLETE 2026 F1 CALENDAR WITH ALL SESSION TIMES
-- ============================================
-- Note: All times in UTC. Convert to local by adding offset.
-- Standard Weekend: Fri (FP1 11:30, FP2 15:00), Sat (FP3 10:30, Quali 14:00), Sun (Race 13:00 local)
-- Sprint Weekend: Fri (FP1 11:30, SQ 15:30), Sat (Sprint 11:00, Quali 15:00), Sun (Race 13:00 local)

-- ROUND 1: AUSTRALIAN GP (March 14-16, 2026) - Melbourne
-- Local: AEDT (UTC+11)
UPDATE races SET
    fp1_time = '2026-03-14T01:30:00Z',
    fp2_time = '2026-03-14T05:00:00Z',
    fp3_time = '2026-03-15T00:30:00Z',
    quali_time = '2026-03-15T04:00:00Z',
    race_time = '2026-03-16T03:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Australian%';

-- ROUND 2: CHINESE GP (March 21-23, 2026) - Shanghai - SPRINT
-- Local: CST (UTC+8)
UPDATE races SET
    fp1_time = '2026-03-21T03:30:00Z',
    sprint_quali_time = '2026-03-21T07:30:00Z',
    sprint_time = '2026-03-22T03:00:00Z',
    quali_time = '2026-03-22T07:00:00Z',
    race_time = '2026-03-23T06:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%Chinese%';

-- ROUND 3: JAPANESE GP (April 4-6, 2026) - Suzuka
-- Local: JST (UTC+9)
UPDATE races SET
    fp1_time = '2026-04-04T02:30:00Z',
    fp2_time = '2026-04-04T06:00:00Z',
    fp3_time = '2026-04-05T02:30:00Z',
    quali_time = '2026-04-05T06:00:00Z',
    race_time = '2026-04-06T05:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Japanese%';

-- ROUND 4: BAHRAIN GP (April 11-13, 2026) - Sakhir
-- Local: AST (UTC+3)
UPDATE races SET
    fp1_time = '2026-04-11T11:30:00Z',
    fp2_time = '2026-04-11T15:00:00Z',
    fp3_time = '2026-04-12T11:30:00Z',
    quali_time = '2026-04-12T15:00:00Z',
    race_time = '2026-04-13T15:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Bahrain%';

-- ROUND 5: SAUDI ARABIAN GP (April 18-20, 2026) - Jeddah
-- Local: AST (UTC+3)
UPDATE races SET
    fp1_time = '2026-04-18T13:30:00Z',
    fp2_time = '2026-04-18T17:00:00Z',
    fp3_time = '2026-04-19T13:30:00Z',
    quali_time = '2026-04-19T17:00:00Z',
    race_time = '2026-04-20T17:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Saudi%';

-- ROUND 6: MIAMI GP (May 2-4, 2026) - Miami - SPRINT
-- Local: EDT (UTC-4)
UPDATE races SET
    fp1_time = '2026-05-02T18:30:00Z',
    sprint_quali_time = '2026-05-02T22:30:00Z',
    sprint_time = '2026-05-03T16:00:00Z',
    quali_time = '2026-05-03T20:00:00Z',
    race_time = '2026-05-04T20:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%Miami%';

-- ROUND 7: EMILIA ROMAGNA GP (May 16-18, 2026) - Imola
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-05-16T11:30:00Z',
    fp2_time = '2026-05-16T15:00:00Z',
    fp3_time = '2026-05-17T10:30:00Z',
    quali_time = '2026-05-17T14:00:00Z',
    race_time = '2026-05-18T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Emilia%' OR name ILIKE '%Imola%';

-- ROUND 8: MONACO GP (May 22-25, 2026)
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-05-22T11:30:00Z',
    fp2_time = '2026-05-22T15:00:00Z',
    fp3_time = '2026-05-24T10:30:00Z',
    quali_time = '2026-05-24T14:00:00Z',
    race_time = '2026-05-25T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Monaco%';

-- ROUND 9: SPANISH GP (June 6-8, 2026) - Barcelona
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-06-06T11:30:00Z',
    fp2_time = '2026-06-06T15:00:00Z',
    fp3_time = '2026-06-07T10:30:00Z',
    quali_time = '2026-06-07T14:00:00Z',
    race_time = '2026-06-08T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Spanish%' OR name ILIKE '%Spain%';

-- ROUND 10: CANADIAN GP (June 20-22, 2026) - Montreal
-- Local: EDT (UTC-4)
UPDATE races SET
    fp1_time = '2026-06-20T17:30:00Z',
    fp2_time = '2026-06-20T21:00:00Z',
    fp3_time = '2026-06-21T16:30:00Z',
    quali_time = '2026-06-21T20:00:00Z',
    race_time = '2026-06-22T18:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Canadian%' OR name ILIKE '%Canada%';

-- ROUND 11: AUSTRIAN GP (July 4-6, 2026) - Spielberg - SPRINT
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-07-04T10:30:00Z',
    sprint_quali_time = '2026-07-04T14:30:00Z',
    sprint_time = '2026-07-05T10:00:00Z',
    quali_time = '2026-07-05T14:00:00Z',
    race_time = '2026-07-06T13:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%Austrian%' OR name ILIKE '%Austria%';

-- ROUND 12: BRITISH GP (July 18-20, 2026) - Silverstone
-- Local: BST (UTC+1)
UPDATE races SET
    fp1_time = '2026-07-18T11:30:00Z',
    fp2_time = '2026-07-18T15:00:00Z',
    fp3_time = '2026-07-19T10:30:00Z',
    quali_time = '2026-07-19T14:00:00Z',
    race_time = '2026-07-20T14:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%British%' OR name ILIKE '%Silverstone%';

-- ROUND 13: BELGIAN GP (Aug 1-3, 2026) - Spa
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-08-01T11:30:00Z',
    fp2_time = '2026-08-01T15:00:00Z',
    fp3_time = '2026-08-02T10:30:00Z',
    quali_time = '2026-08-02T14:00:00Z',
    race_time = '2026-08-03T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Belgian%' OR name ILIKE '%Spa%';

-- ROUND 14: HUNGARIAN GP (Aug 15-17, 2026) - Budapest
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-08-15T11:30:00Z',
    fp2_time = '2026-08-15T15:00:00Z',
    fp3_time = '2026-08-16T10:30:00Z',
    quali_time = '2026-08-16T14:00:00Z',
    race_time = '2026-08-17T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Hungarian%' OR name ILIKE '%Hungary%';

-- ROUND 15: DUTCH GP (Aug 29-31, 2026) - Zandvoort
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-08-29T10:30:00Z',
    fp2_time = '2026-08-29T14:00:00Z',
    fp3_time = '2026-08-30T09:30:00Z',
    quali_time = '2026-08-30T13:00:00Z',
    race_time = '2026-08-31T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Dutch%' OR name ILIKE '%Netherlands%' OR name ILIKE '%Zandvoort%';

-- ROUND 16: ITALIAN GP (Sept 5-7, 2026) - Monza
-- Local: CEST (UTC+2)
UPDATE races SET
    fp1_time = '2026-09-05T11:30:00Z',
    fp2_time = '2026-09-05T15:00:00Z',
    fp3_time = '2026-09-06T10:30:00Z',
    quali_time = '2026-09-06T14:00:00Z',
    race_time = '2026-09-07T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Italian%' AND name NOT ILIKE '%Emilia%';

-- ROUND 17: AZERBAIJAN GP (Sept 19-21, 2026) - Baku
-- Local: AZT (UTC+4)
UPDATE races SET
    fp1_time = '2026-09-19T09:30:00Z',
    fp2_time = '2026-09-19T13:00:00Z',
    fp3_time = '2026-09-20T08:30:00Z',
    quali_time = '2026-09-20T12:00:00Z',
    race_time = '2026-09-21T11:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Azerbaijan%' OR name ILIKE '%Baku%';

-- ROUND 18: SINGAPORE GP (Oct 3-5, 2026) - Marina Bay
-- Local: SGT (UTC+8)
UPDATE races SET
    fp1_time = '2026-10-03T09:30:00Z',
    fp2_time = '2026-10-03T13:00:00Z',
    fp3_time = '2026-10-04T09:30:00Z',
    quali_time = '2026-10-04T13:00:00Z',
    race_time = '2026-10-05T12:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Singapore%';

-- ROUND 19: US GP (Oct 17-19, 2026) - Austin - SPRINT
-- Local: CDT (UTC-5)
UPDATE races SET
    fp1_time = '2026-10-17T18:30:00Z',
    sprint_quali_time = '2026-10-17T22:30:00Z',
    sprint_time = '2026-10-18T18:00:00Z',
    quali_time = '2026-10-18T22:00:00Z',
    race_time = '2026-10-19T19:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%United States%' OR name ILIKE '%Austin%' OR name ILIKE '%COTA%';

-- ROUND 20: MEXICAN GP (Oct 25-27, 2026) - Mexico City
-- Local: CDT (UTC-5)
UPDATE races SET
    fp1_time = '2026-10-25T18:30:00Z',
    fp2_time = '2026-10-25T22:00:00Z',
    fp3_time = '2026-10-26T17:30:00Z',
    quali_time = '2026-10-26T21:00:00Z',
    race_time = '2026-10-27T20:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Mexico%';

-- ROUND 21: BRAZILIAN GP (Nov 7-9, 2026) - Sao Paulo - SPRINT
-- Local: BRT (UTC-3)
UPDATE races SET
    fp1_time = '2026-11-07T14:30:00Z',
    sprint_quali_time = '2026-11-07T18:30:00Z',
    sprint_time = '2026-11-08T14:00:00Z',
    quali_time = '2026-11-08T18:00:00Z',
    race_time = '2026-11-09T17:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%Brazil%' OR name ILIKE '%São Paulo%' OR name ILIKE '%Sao Paulo%';

-- ROUND 22: LAS VEGAS GP (Nov 22-23, 2026) - Night Race
-- Local: PST (UTC-8)
UPDATE races SET
    fp1_time = '2026-11-21T04:30:00Z',
    fp2_time = '2026-11-21T08:00:00Z',
    fp3_time = '2026-11-22T04:30:00Z',
    quali_time = '2026-11-22T08:00:00Z',
    race_time = '2026-11-23T06:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Las Vegas%';

-- ROUND 23: QATAR GP (Nov 28-30, 2026) - Lusail - SPRINT
-- Local: AST (UTC+3)
UPDATE races SET
    fp1_time = '2026-11-28T13:30:00Z',
    sprint_quali_time = '2026-11-28T17:30:00Z',
    sprint_time = '2026-11-29T13:00:00Z',
    quali_time = '2026-11-29T17:00:00Z',
    race_time = '2026-11-30T16:00:00Z',
    is_sprint_weekend = TRUE
WHERE name ILIKE '%Qatar%';

-- ROUND 24: ABU DHABI GP (Dec 5-7, 2026) - Yas Marina - SEASON FINALE
-- Local: GST (UTC+4)
UPDATE races SET
    fp1_time = '2026-12-05T09:30:00Z',
    fp2_time = '2026-12-05T13:00:00Z',
    fp3_time = '2026-12-06T10:30:00Z',
    quali_time = '2026-12-06T14:00:00Z',
    race_time = '2026-12-07T13:00:00Z',
    is_sprint_weekend = FALSE
WHERE name ILIKE '%Abu Dhabi%';

-- ============================================
-- 4. VERIFY ALL UPDATES
-- ============================================
SELECT 
    id, 
    name, 
    circuit,
    fp1_time,
    fp2_time,
    fp3_time,
    sprint_quali_time,
    sprint_time,
    quali_time,
    race_time,
    is_sprint_weekend
FROM races 
ORDER BY race_time;
