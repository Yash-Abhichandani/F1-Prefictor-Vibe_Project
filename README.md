<div align="center">
  
# 🏎️ **F1 APEX** | *Telemetry Command Center*

### Where Data Meets Destiny

![F1 Apex Banner](https://img.shields.io/badge/🔴_LIVE-2026_Season-E10600?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Operational-00E5FF?style=for-the-badge&logo=checkmarx&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

<br/>

*"Lights out and away we go."* — Martin Brundle

---

**Imagine having your own race engineer's pit wall.**  
**Imagine predicting the chaos before the first corner.**  
**Imagine competing against rivals who think they know better.**

**Welcome to F1 Apex.**

</div>

---

## 🎯 What Is F1 Apex?

F1 Apex isn't just another fantasy F1 app. It's a **full-fledged prediction command center** built with the same obsessive attention to detail that race engineers bring to their telemetry screens.

Every weekend, millions of F1 fans predict race outcomes in their heads. *"Verstappen will dominate."* *"Watch out for McLaren in the wet."* *"Alpine might surprise everyone."*

**But how often are you right?**

F1 Apex lets you **prove it**. Submit your predictions before the lights go out, and let the algorithm calculate your score with surgical precision.

---

## 🌟 Why You'll Love This

<table>
<tr>
<td width="50%" valign="top">

### 🖥️ **The Command Center**
Your personalized dashboard displays live race countdowns, recent podium results, championship deltas, and your prediction accuracy—all rendered with a **glassmorphic UI** that feels like you're staring at an F1 broadcast.

### ⏱️ **Precision Predictions**
Lock in your **Qualifying Top 3**, **Race Top 10**, and **Fastest Lap** picks before sessions begin. Our scoring system rewards accuracy, risk-taking, and intuition.

### 📡 **Real-Time Telemetry**
We pull official classification data from the **Ergast/Jolpica API** the moment the checkered flag waves. No manual updates. No waiting. Just instant, automated scoring.

</td>
<td width="50%" valign="top">

### 🏆 **Global & Private Leagues**
Create private leagues for your friends, join the **Global Championship**, or do both. Each league has its own chat, standings, and admin tools.

### 👤 **Driver Profiles**
Track your career stats, prediction streaks, favorite team allegiance, and earned achievements. Become the **Oracle** by hitting 90%+ accuracy.

### ⚔️ **Head-to-Head Rivalries**
Challenge your friends to season-long rivalry battles. Every race is a chance to extend your lead or mount a comeback.

</td>
</tr>
</table>

---

## 🎨 Design Philosophy: "Modern Telemetry"

Every pixel of F1 Apex is intentional. We studied the **high-contrast, information-dense graphics** of F1 broadcasts and recreated that aesthetic for the web.

<table>
<tr><td><b>🎨 Color Palette</b></td><td></td></tr>
<tr><td><code>#0D1117</code></td><td><b>Void Black</b> — The asphalt beneath your tires</td></tr>
<tr><td><code>#E10600</code></td><td><b>F1 Red</b> — The passion that drives you</td></tr>
<tr><td><code>#00E5FF</code></td><td><b>Telemetry Cyan</b> — The data that illuminates</td></tr>
<tr><td><code>#C9A962</code></td><td><b>Victory Gold</b> — The glory you chase</td></tr>
</table>

**Typography:** `Orbitron` for displays, `Titillium Web` for headers, `Inter` for readability, and `Roboto Mono` for data.

**Textures:** Subtle noise overlays, gradient blurs, and animated canvas backgrounds simulate carbon fiber and glass cockpit interfaces.

---

## 🛠️ Technical Architecture

Built for **speed**, **scalability**, and **developer experience**.

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 VERCEL EDGE NETWORK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────────┐          ┌───────────────────────┐     │
│   │  Next.js 16   │◄────────►│  FastAPI Backend      │     │
│   │  React 19     │          │  Python 3.12          │     │
│   │  Tailwind v4  │          │  Pydantic Validation  │     │
│   └───────────────┘          └───────────────────────┘     │
│           │                            │                    │
│           └────────────┬───────────────┘                    │
│                        ▼                                    │
│              ┌─────────────────────┐                        │
│              │  Supabase           │                        │
│              │  PostgreSQL + Auth  │                        │
│              │  Real-time Channels │                        │
│              └─────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Chassis** | Next.js 16 + React 19 | App Router, SSR, Edge Optimization |
| **Aero Package** | Tailwind CSS v4 | Design tokens, responsive utilities |
| **Power Unit** | FastAPI + Python | High-performance API, scoring engine |
| **Telemetry** | Supabase | PostgreSQL, Auth, Real-time subscriptions |
| **Grid Position** | Vercel | Global CDN, serverless functions |
| **Analytics** | Vercel Analytics + Speed Insights | Performance monitoring |

---

## 📊 How Scoring Works

Our scoring system rewards **accuracy** and **boldness**.

```
╔═══════════════════════════════════════════════════════════╗
║                    QUALIFYING POINTS                       ║
╠═══════════════════════════════════════════════════════════╣
║   🥇 Pole Position (P1):           5 points               ║
║   🥈 P2 Prediction:                3 points               ║
║   🥉 P3 Prediction:                1 point                ║
╠═══════════════════════════════════════════════════════════╣
║                      RACE POINTS                           ║
╠═══════════════════════════════════════════════════════════╣
║   🏆 Race Winner (P1):            10 points               ║
║   🥈 P2 Prediction:                8 points               ║
║   🥉 P3 Prediction:                6 points               ║
║   ⏱️  Fastest Lap:                 3 points               ║
╠═══════════════════════════════════════════════════════════╣
║                    BONUS POINTS                            ║
╠═══════════════════════════════════════════════════════════╣
║   🎩 Hat Trick (Pole + Win):      +2 points               ║
║   🎯 Podium Trio (Exact Order):   +5 points               ║
║   🎲 Podium Trio (Any Order):     +2 points               ║
╚═══════════════════════════════════════════════════════════╝
```

**Wild Card Bonuses:** League admins can award extra points for "Wild Predictions," "Biggest Flops," and "Biggest Surprises."

---

## 🚀 Quick Start: Get On Track

### Prerequisites
- Node.js 18+ and npm
- A Supabase project ([Create one free](https://supabase.com))
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Yash-Abhichandani/F1-Prefictor-Vibe_Project.git
cd fl-predictor
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Create a `.env.local` file in the root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx
```

### 4️⃣ Initialize Database
Run the SQL schemas in Supabase SQL Editor (in order):
1. `database_schema.sql` — Core tables + 2026 calendar
2. `leagues_schema.sql` — League system
3. `friends_and_chat_schema.sql` — Social features
4. `enhancements_schema.sql` — Achievements + activity feed

### 5️⃣ Ignition
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — Welcome to your pit wall.

---

## 🏁 The 2026 Grid

F1 Apex includes the **complete 2026 driver lineup** with all 11 teams:

| Team | Drivers |
|:-----|:--------|
| 🔵 **Red Bull Racing** | Max Verstappen (1), Isack Hadjar (6) |
| 🟠 **McLaren** | Lando Norris (4), Oscar Piastri (81) |
| 🔴 **Ferrari** | Charles Leclerc (16), Lewis Hamilton (44) |
| ⚫ **Mercedes** | George Russell (63), Kimi Antonelli (12) |
| 🟢 **Aston Martin** | Fernando Alonso (14), Lance Stroll (18) |
| 🔵 **Williams** | Carlos Sainz (55), Alexander Albon (23) |
| 💗 **Alpine** | Pierre Gasly (10), Franco Colapinto (43) |
| ⚪ **Haas** | Esteban Ocon (31), Oliver Bearman (87) |
| 🔷 **RB** | Yuki Tsunoda (22), Liam Lawson (30) |
| 🟡 **Sauber** | Nico Hulkenberg (27), Gabriel Bortoleto (5) |
| 🇺🇸 **Cadillac** | Valtteri Bottas (77), Sergio Perez (11) |

---

## 📁 Project Structure

```
fl-predictor/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 components/           # Reusable UI components
│   │   ├── Navbar.tsx           # Navigation with auth state
│   │   ├── Footer.tsx           # Site footer
│   │   ├── PredictionForm.tsx   # Race prediction form
│   │   ├── TelemetryBackground/ # Animated canvas background
│   │   ├── LeagueChat.tsx       # Real-time chat
│   │   └── ...40+ components
│   ├── 📂 lib/                  # Utilities & data
│   │   ├── drivers.ts           # 2026 driver grid
│   │   ├── supabase.ts          # Supabase client
│   │   └── api.ts               # API client
│   └── 📂 [routes]/             # Page routes
├── 📂 api/                      # FastAPI backend
│   ├── main.py                  # API endpoints
│   ├── scoring.py               # Points calculation
│   └── requirements.txt         # Python dependencies
├── 📂 lib/                      # Shared config
│   └── config.ts                # Environment configuration
├── 📄 *.sql                     # Database schemas
├── 📄 vercel.json               # Deployment config
└── 📄 package.json              # Node dependencies
```

---

## 🛡️ Security & Performance

- **Row Level Security (RLS)** — All Supabase tables protected
- **Rate Limiting** — Configurable per-endpoint limits
- **Pydantic Validation** — Strict input validation
- **JWT Verification** — Secure token authentication
- **Vercel Analytics** — Visitor tracking
- **Speed Insights** — Core Web Vitals monitoring

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core Prediction Engine & Authentication
- [x] **Phase 2:** "Modern Telemetry" UI/UX Design System
- [x] **Phase 3:** Real-time API Integration (Results & Standings)
- [x] **Phase 4:** Leagues, Rivalries & Social Features
- [ ] **Phase 5:** Live Race Chat & Push Notifications
- [ ] **Phase 6:** Mobile App (React Native)

---

## 🤝 Contributing

We welcome fellow race engineers.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/NewAeroPackage`)
3. **Commit** your changes (`git commit -m 'Add new rear wing'`)
4. **Push** to the branch (`git push origin feature/NewAeroPackage`)
5. **Open** a Pull Request

---

## 📜 License

This is an **unofficial fan project** and is not affiliated with Formula 1, FIA, or any F1 team. All trademarks belong to their respective owners.

---

<div align="center">

### Built with ❤️, ☕, and a borderline unhealthy obsession with F1

*"If you no longer go for a gap that exists, you are no longer a racing driver."* — Ayrton Senna

<br/>

**[⬆ Back to Top](#-f1-apex--telemetry-command-center)**

---

**Made by [Yash Abhichandani](https://github.com/Yash-Abhichandani)**

</div>
