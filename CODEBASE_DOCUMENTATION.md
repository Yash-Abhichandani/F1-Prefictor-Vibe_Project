# 🏎️ F1 Apex — Complete Codebase Documentation

> **Last Updated:** January 21, 2026  
> **Purpose:** Comprehensive reference for developers working on this project
> **Status:** Production-Ready | 2026 Season

---

## 📖 Introduction

**F1 Apex** is a full-stack Formula 1 prediction platform that transforms race weekends into strategic competitions. Users predict qualifying and race results, compete in leagues, and climb global standings—all through an interface designed to feel like a race engineer's pit wall.

This document serves as the **single source of truth** for developers. It covers architecture decisions, database design, API contracts, component structure, and operational best practices.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (BROWSER)                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Next.js 16 App                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Pages   │  │Components│  │   Lib    │              │   │
│  │  │ (Routes) │  │ (40+)    │  │ (API/DB) │              │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │   │
│  │       └─────────────┼─────────────┘                     │   │
│  └─────────────────────┼───────────────────────────────────┘   │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Supabase Client (Real-time)                 │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   FastAPI Backend     │       │   Supabase Cloud      │
│   (Vercel Serverless) │◄─────►│   PostgreSQL + Auth   │
│   Python 3.12         │       │   Row Level Security  │
└───────────────────────┘       └───────────────────────┘
```

### Why This Stack?

| Technology | Rationale |
|:-----------|:----------|
| **Next.js 16** | Latest App Router with React Server Components. Enables streaming, partial prerendering, and edge optimization. |
| **React 19** | Concurrent features, improved hydration, and enhanced developer experience. |
| **FastAPI** | Python's fastest web framework. Automatic OpenAPI docs, async support, and Pydantic validation. |
| **Supabase** | Managed PostgreSQL with built-in auth, real-time subscriptions, and Row Level Security. Zero backend auth code needed. |
| **Tailwind CSS v4** | Design tokens, responsive utilities, and the new Lightning CSS engine for faster builds. |
| **Vercel** | Seamless Next.js deployment with automatic preview deployments and edge functions. |

---

## 📁 Project Structure (Deep Dive)

```
fl-predictor/
│
├── 📂 app/                          # Next.js App Router (all routes)
│   │
│   ├── 📄 layout.tsx                # Root layout with providers, fonts, analytics
│   ├── 📄 page.tsx                  # Landing page (Hero, Features, CTA)
│   ├── 📄 globals.css               # CSS variables, design tokens, base styles
│   │
│   ├── 📂 components/               # Reusable UI components (40+)
│   │   ├── Navbar.tsx               # Navigation with auth state, mobile menu
│   │   ├── Footer.tsx               # Site footer with legal links
│   │   ├── PredictionForm.tsx       # Multi-step prediction form
│   │   ├── LaunchSequence.tsx       # Race countdown timer (animated)
│   │   ├── RivalryCard.tsx          # Head-to-head rivalry display
│   │   ├── LeagueChat.tsx           # Real-time chat with reactions
│   │   ├── TelemetryBackground.tsx  # Animated canvas background (470+ lines)
│   │   ├── ConfidenceMeter.tsx      # Prediction confidence indicator
│   │   ├── WeatherWidget.tsx        # Circuit weather display
│   │   ├── GlassCard.tsx            # Glassmorphic card component
│   │   ├── Badge.tsx                # Status badges (team colors)
│   │   ├── TeamRadioToast.tsx       # Toast notifications (F1 radio style)
│   │   └── ...                      # 30+ more components
│   │
│   ├── 📂 lib/                      # Shared utilities and data
│   │   ├── drivers.ts               # Complete 2026 driver grid (22 drivers)
│   │   ├── supabase.ts              # Supabase browser client
│   │   └── teams.ts                 # Team colors and metadata
│   │
│   ├── 📂 (routes)/                 # Feature routes
│   │   ├── 📂 predict/[id]/         # Prediction form (dynamic)
│   │   ├── 📂 calendar/             # 2026 race calendar
│   │   ├── 📂 standings/            # Global leaderboard
│   │   ├── 📂 leagues/              # League management
│   │   ├── 📂 rivalries/            # Rivalry battles
│   │   ├── 📂 profile/              # User profiles
│   │   ├── 📂 admin/                # Admin dashboard (protected)
│   │   └── ...                      # 15+ feature routes
│   │
│   └── 📄 middleware.ts             # Auth route protection
│
├── 📂 api/                          # FastAPI Backend (Vercel Serverless)
│   ├── index.py                     # Vercel entry point
│   ├── main.py                      # All API endpoints (1500+ lines)
│   ├── scoring.py                   # Points calculation engine
│   └── requirements.txt             # Python dependencies
│
├── 📂 lib/                          # Root-level shared config
│   └── config.ts                    # Environment configuration
│
├── 📂 public/                       # Static assets
│   └── manifest.json                # PWA manifest
│
├── 📄 vercel.json                   # Deployment routing config
├── 📄 tailwind.config.js            # Tailwind customization
├── 📄 *.sql                         # Database schema files
└── 📄 package.json                  # Node dependencies
```

---

## 🗄️ Database Schema

### Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  profiles   │──────<│ predictions │>──────│    races    │
│  (users)    │       │             │       │ (calendar)  │
└──────┬──────┘       └─────────────┘       └─────────────┘
       │
       ├──────────────────────────────────────────────┐
       │                                              │
       ▼                                              ▼
┌─────────────────┐                          ┌───────────────┐
│ league_members  │>────────────────────────<│    leagues    │
└────────┬────────┘                          └───────────────┘
         │
         ├─────────────────────┬─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ league_messages │  │   friendships   │  │   rivalries     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Core Tables

| Table | Purpose | Key Fields |
|:------|:--------|:-----------|
| **`profiles`** | Extended user data beyond Supabase auth | `id`, `username`, `avatar_url`, `total_score`, `is_admin`, `favorite_team` |
| **`races`** | 2026 F1 calendar with all sessions | `id`, `name`, `circuit`, `country`, `quali_time`, `race_time`, `is_sprint`, `fp1_time`, `fp2_time`, `fp3_time`, `sprint_quali_time`, `sprint_time` |
| **`predictions`** | User predictions per race | `user_id`, `race_id`, `quali_p1/p2/p3_driver`, `race_p1-p10_driver`, `fastest_lap_driver`, `points_total` |

### League System Tables

| Table | Purpose | Key Relationships |
|:------|:--------|:------------------|
| **`leagues`** | League definitions | `owner_id` → `profiles` |
| **`league_members`** | Memberships with roles | `user_id` → `profiles`, `league_id` → `leagues` |
| **`league_invites`** | Pending invitations | `inviter_id`, `invitee_id` → `profiles` |
| **`league_prediction_grades`** | Admin-graded scores | `grader_id`, `prediction_id` |

### Social Tables

| Table | Purpose |
|:------|:--------|
| **`friendships`** | Friend relationships with status (pending/accepted/declined) |
| **`league_messages`** | Chat messages per league with real-time subscriptions |
| **`message_reactions`** | Emoji reactions on chat messages |
| **`activity_feed`** | Activity log for user feeds |
| **`achievements`** | Achievement definitions (Oracle, Streak Master, etc.) |
| **`user_achievements`** | Earned achievements per user |
| **`rivalries`** | Head-to-head rivalry matchups |

### Row Level Security (RLS)

Every table has RLS policies. Key patterns:
- **Profiles:** Users can read all, update their own
- **Predictions:** Users can read/write their own, admins can read all
- **Leagues:** Members can read, owners/admins can update
- **Messages:** League members can read/write

---

## 🔌 API Reference

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-domain.vercel.app/api`

### Authentication
All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <supabase_access_token>
```

### Rate Limiting
| Endpoint Category | Limit |
|:-----------------|:------|
| Public endpoints | 30 req/min |
| Predictions | 10 req/min |
| Chat messages | 20 req/min |

### Endpoint Reference

#### Public Endpoints
```
GET  /                    Health check
GET  /health              Detailed health with database status
GET  /races               All races (2026 calendar)
GET  /races/{id}          Single race with session times
GET  /standings           Global leaderboard (top 100)
GET  /achievements        All achievement definitions
```

#### Authenticated Endpoints
```
POST /predict             Submit prediction for a race
GET  /predictions/me      User's own predictions
GET  /leagues             List user's leagues
POST /leagues             Create new league
GET  /leagues/{id}        League details with standings
POST /leagues/join        Join via invite code
POST /leagues/{id}/leave  Leave a league
GET  /friends             Friend list with status
POST /friends/request     Send friend request
POST /friends/respond     Accept/decline request
GET  /leagues/{id}/chat   Get chat messages (paginated)
POST /leagues/{id}/chat   Send message
POST /leagues/{id}/chat/{msg_id}/react   Add reaction
```

#### Admin Endpoints
```
GET  /admin/predictions/{race_id}   All predictions for a race
POST /admin/grade                   Grade a prediction
POST /admin/settle                  Settle race (calculate points)
```

### Request/Response Examples

#### Submit Prediction
```http
POST /predict
Content-Type: application/json
Authorization: Bearer <token>

{
  "race_id": 1,
  "quali_p1_driver": "Verstappen",
  "quali_p2_driver": "Norris",
  "quali_p3_driver": "Leclerc",
  "race_p1_driver": "Verstappen",
  "race_p2_driver": "Hamilton",
  "race_p3_driver": "Norris",
  "fastest_lap_driver": "Verstappen"
}
```

#### Response
```json
{
  "success": true,
  "prediction_id": 42,
  "message": "Prediction submitted successfully"
}
```

---

## 📊 Scoring Engine

Located in `api/scoring.py`, the scoring system calculates points with these rules:

```python
# === QUALIFYING ===
QUALI_P1 = 5  # Pole position
QUALI_P2 = 3
QUALI_P3 = 1

# === RACE ===
RACE_P1  = 10  # Winner
RACE_P2  = 8
RACE_P3  = 6
RACE_P4  = 5
RACE_P5  = 4
RACE_P6  = 3
RACE_P7  = 2
RACE_P8  = 1
RACE_P9  = 1
RACE_P10 = 1

# === BONUSES ===
FASTEST_LAP    = 3
HAT_TRICK      = 2   # Pole + Win
PODIUM_EXACT   = 5   # P1-P2-P3 exact order
PODIUM_ANY     = 2   # P1-P2-P3 any order

# === LEAGUE GRADING (Manual) ===
WILD_PREDICTION   = 0-50  # Admin discretion
BIGGEST_FLOP      = 0-50
BIGGEST_SURPRISE  = 0-50
```

---

## 🎨 Design System

### CSS Variables (globals.css)

```css
:root {
  /* Backgrounds */
  --bg-gunmetal: #0D1117;
  --bg-carbon: #1F2833;
  --bg-carbon-light: #2A3A4B;
  
  /* Accents */
  --accent-cyan: #00E5FF;
  --accent-teal: #00BFA5;
  --signal-red: #FF0000;
  --f1-red: #E10600;
  --gold: #C9A962;
  
  /* Text */
  --text-grey: #C5C6C7;
  --text-silver: #9E9E9E;
  --text-white: #FFFFFF;
  
  /* Gradients */
  --gradient-cyan: linear-gradient(135deg, #00E5FF 0%, #00BFA5 100%);
  --gradient-hero: linear-gradient(180deg, #0D1117 0%, #1F2833 100%);
}
```

### Font Stack

| Usage | Font | Weight |
|:------|:-----|:-------|
| Display/Headers | Orbitron | 700–900 |
| Subheadings | Titillium Web | 600–700 |
| Body Text | Inter | 400–500 |
| Data/Telemetry | Roboto Mono | 400–500 |
| Code | JetBrains Mono | 400 |

### Component Patterns

**GlassCard** — Glassmorphic container with blur
```tsx
<GlassCard variant="default" className="p-6">
  {children}
</GlassCard>
```

**Badge** — Team-colored status indicator
```tsx
<Badge team="redbull" variant="outline">
  P1
</Badge>
```

**TeamRadioToast** — F1 radio-style notifications
```tsx
showTeamRadio("Prediction saved!", "success");
```

---

## 🔐 Security Checklist

### Production Requirements
- [ ] Set `ALLOWED_ORIGINS` to production domain
- [ ] Configure Supabase environment variables on Vercel
- [ ] Run all SQL schemas in Supabase
- [ ] Enable RLS on all tables
- [ ] Verify `is_admin` is set for admin users
- [ ] Set up rate limiting rules

### Safari Compatibility
The API client (`lib/api.ts`) includes Safari-specific header sanitization:
```typescript
// Headers that cause Safari to fail silently
const FORBIDDEN_SAFARI_HEADERS = ['content-length'];
```

---

## 🚀 Deployment

### Vercel Configuration (vercel.json)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.py" }
  ],
  "functions": {
    "api/index.py": {
      "runtime": "python3.12"
    }
  }
}
```

### Environment Variables
| Variable | Where | Description |
|:---------|:------|:------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anon key |
| `SUPABASE_URL` | Vercel | Backend Supabase URL |
| `SUPABASE_KEY` | Vercel | Service role key |
| `ALLOWED_ORIGINS` | Vercel | CORS allowed domains |

### Monitoring
- **Vercel Analytics** — Visitor tracking
- **Speed Insights** — Core Web Vitals

---

## 🧪 Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production (type-check + bundle)
npm run build

# Start production server locally
npm run start

# Run ESLint
npm run lint

# Backend (local development)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🔄 Data Flow

### Prediction Submission Flow
```
1. User fills PredictionForm.tsx
         ↓
2. Client calls POST /predict via lib/api.ts
         ↓
3. FastAPI validates with Pydantic model
         ↓
4. Backend checks:
   - User authenticated?
   - Race exists?
   - Prediction deadline passed?
         ↓
5. Supabase INSERT into predictions table
         ↓
6. Success response → Toast notification
```

### Race Settlement Flow (Admin)
```
1. Admin clicks "Settle Race" button
         ↓
2. POST /admin/settle { race_id, results }
         ↓
3. scoring.py calculates points for each prediction
         ↓
4. Batch UPDATE predictions SET points_total
         ↓
5. UPDATE profiles SET total_score += points
         ↓
6. Leaderboard automatically reflects new standings
```

---

## 📚 Additional Resources

| Document | Purpose |
|:---------|:--------|
| `README.md` | User-facing project overview |
| `DEPLOYMENT.md` | Step-by-step deployment guide |
| `FUTURE_ENHANCEMENTS.md` | Planned features |
| `database_schema.sql` | Core PostgreSQL schema |
| `leagues_schema.sql` | League system schema |

---

## ✅ Quick Reference

### Protected Routes (middleware.ts)
```
/predict/*
/submissions
/results
/admin/*
/profile (authenticated features)
```

### Key Component Locations
| What | Where |
|:-----|:------|
| Driver Grid Data | `app/lib/drivers.ts` |
| Team Colors | `app/lib/teams.ts` |
| API Client | `lib/api.ts` |
| Environment Config | `lib/config.ts` |
| Supabase Client | `app/lib/supabase.ts` |

---

> **Pro Tip:** When debugging, check the browser console AND the Vercel function logs. Supabase RLS errors often appear only in function logs.

---

**Document maintained by the F1 Apex development team.**  
*Last verified: January 2026*
