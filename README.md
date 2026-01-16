
# 🏎️ F1 APEX | TELEMETRY COMMAND CENTER

![F1 Apex Banner](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge&logo=formula1)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

> *"Lights out and away we go."*

**F1 Apex** is the ultimate high-fidelity prediction platform for the data-driven Formula 1 fan. Designed with a **"Modern Telemetry"** aesthetic, it turns every race weekend into a strategic battle of intellect, allowing you to compete against friends and the global grid using real-time data integration.

---

## 🧭 MISSION BRIEF

This isn't just a fantasy league; it's your **Pit Wall**.
We have engineered a platform that mirrors the sleek, data-dense interfaces used by race engineers. Every pixel is optimized for speed, clarity, and immersion.

### 🌟 KEY FEATURES

*   **🖥️ Command Center Dashboard**: A glassmorphic, responsive hub featuring live countdowns, recent podiums, and championship deltas.
*   **⏱️ Precision Prediction Engine**: Lock in your Qualifying Top 3, Race Top 10, and Fastest Lap before the lights go out.
*   **📡 Real-Time Telemetry**: Seamless integration with the **Ergast Developer API** (via Jolpica) for official classification and standings.
*   **🏆 Global Leagues**: Compete in private squads or take on the world in the Global Championship.
*   **👤 Driver Profile**: Track your career stats, prediction accuracy, and favorite team allegiance.
*   **🔔 Race Control Alerts**: Real-time notifications for session starts and prediction deadlines.

---

## 🛠️ TECHNICAL SPECIFICATIONS

Built on a bleeding-edge stack designed for performance and scalability.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Chassis (Frontend)** | **Next.js 15** | Server-Side Rendering, App Router, Optimization |
| **Aero (Styling)** | **Tailwind CSS** | "Modern Telemetry" Design System, Glassmorphism |
| **Engine (Backend)** | **FastAPI (Python)** | High-performance API, Data Processing |
| **Tele(database)** | **Supabase** | PostgreSQL, Real-time Subscriptions, Auth |
| **Grid (Deploy)** | **Vercel** | Serverless Functions, Edge Network |

---

## ⚡ QUICK START (PIT STRATEGY)

Follow these protocols to Initialize your local instance.

### 1. CLONE REPOSITORY
```bash
git clone https://github.com/Yash-Abhichandani/F1-Prefictor-Vibe_Project.git
cd fl-predictor
```

### 2. INSTALL DEPENDENCIES
```bash
npm install
```

### 3. CONFIGURE ENVIRONMENT
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. IGNITION
```bash
npm run dev
```
Access the pit wall at `http://localhost:3000`.

---

## 🎨 DESIGN SYSTEM: "MODERN TELEMETRY"

Our UI language is derived from the high-contrast, information-dense graphics of F1 broadcasts.

-   **Typography**: `Orbitron` (Headers) & `Inter` (Data).
-   **Palette**:
    -   `Void Black` (#050506) - *The Asphalt*
    -   `F1 Red` (#E10600) - *The Passion*
    -   `Cyan Glow` (#00D4FF) - *The Data*
    -   `Victory Gold` (#C9A962) - *The Glory*
-   **Texture**: Subtle SVG noise overlays and gradient blurs to mimic high-end carbon fiber and glass interfaces.

---

## 🗺️ ROADMAP (2026 SEASON)

-   [x] **Phase 1: Shakedown** - Core Prediction Engine & Auth.
-   [x] **Phase 2: Aerodynamics** - UI/UX Overhaul & "Modern Telemetry" Theme.
-   [x] **Phase 3: Telemetry** - Real-time API integration for Results & Standings.
-   [ ] **Phase 4: Overtake** - Live Race Chat & Paddock Social Features.

---

## 🤝 CONTRIBUTING

Pit crew members are always welcome.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/NewAeroPackage`)
3.  Commit your Changes (`git commit -m 'Add new rear wing'`)
4.  Push to the Branch (`git push origin feature/NewAeroPackage`)
5.  Open a Pull Request

---

> *"No heroics into Sainte Dévote please."*

**Built with ❤️ and ☕ by Yash Abhichandani**
