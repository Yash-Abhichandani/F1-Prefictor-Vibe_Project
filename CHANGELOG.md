# 📋 F1 Apex — Version History & Changelog

<div align="center">

![Version](https://img.shields.io/badge/Current_Version-3.0-E10600?style=for-the-badge)
![Commits](https://img.shields.io/badge/Total_Commits-93-00E5FF?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-00D26A?style=for-the-badge)

*A comprehensive record of every push to the F1 Apex repository*

</div>

---

## 🗓️ Release Timeline

| Version | Date | Codename | Highlights |
|:--------|:-----|:---------|:-----------|
| **v3.0** | Jan 21, 2026 | Analytics & Engagement | Analytics Dashboard, Live Timing, Email System |
| **v2.5** | Jan 21, 2026 | Mobile Optimization | Session hardening, mobile responsive fixes |
| **v2.4** | Jan 20, 2026 | Copyright & Contact | Legal disclaimers, contact info updates |
| **v2.3** | Jan 16, 2026 | Modern Telemetry | Complete UI overhaul, Vercel Analytics |
| **v2.2** | Jan 16, 2026 | Stability | Project restructure, deployment fixes |
| **v2.1** | Jan 15, 2026 | Rivalry Release | Profile access, backend strong typing |
| **v2.0** | Jan 15, 2026 | Production Ready | Clean deployment, security patches |
| **v1.0** | Jan 10, 2026 | Genesis | Initial commit, core architecture |

---

## 🚀 Version 3.0 — Analytics & Engagement Release
**Released:** January 21, 2026 | **Commits:** 21223c2

### 📚 Documentation Refresh
| Commit | Time | Description |
|:-------|:-----|:------------|
| `21223c2` | 15:50 | **docs(v3.0):** Comprehensive documentation refresh |
| | | ↳ Updated README.md with Premium Features table |
| | | ↳ CODEBASE_DOCUMENTATION.md bumped to v3.0 (35+ components) |
| | | ↳ Marked all Priority 1 features complete in roadmap docs |

---

## 🔧 Version 2.5 — Mobile Optimization
**Released:** January 21, 2026 | **Commits:** 14

### 🐛 Critical Fixes
| Commit | Time | Description |
|:-------|:-----|:------------|
| `468ec72` | 15:18 | **fix(ui):** Expose logout button on profile and navbar |
| `8d3046b` | 15:07 | **fix(mobile):** Resolve unresponsiveness on mobile devices |
| `3bf14e3` | 15:02 | **fix(auth):** Bulletproof session recovery — PRODUCTION CRITICAL |
| `15865d0` | 14:56 | **fix(ui):** Add top padding to calendar page to prevent navbar overlap |

### 📱 Mobile Responsive
| Commit | Time | Description |
|:-------|:-----|:------------|
| `9519000` | 14:54 | **style(mobile):** Optimize charts and profile layout |
| `14f2dc3` | 14:53 | **fix(mobile):** Optimize leaderboard table padding and scrolling |
| `5deb281` | 14:52 | **fix(mobile):** Optimize leaderboard and standings tables |
| `79fad33` | 14:49 | **style:** Mobile optimization Phase 1 — Hero typography |

### 🔐 Authentication Hardening
| Commit | Time | Description |
|:-------|:-----|:------------|
| `111dfac` | 14:43 | **fix:** Robust session recovery |
| `a53f4ed` | 14:39 | **fix:** Add missing useEffect import |
| `aea5080` | 14:38 | **fix:** Robust login timeout and session check |
| `029e689` | 14:22 | **fix:** Resolve persistent loading screen |
| `ddb0a75` | 14:11 | **fix:** Resolve infinite loop and auth crash |

### ✨ New Features
| Commit | Time | Description |
|:-------|:-----|:------------|
| `d328831` | 13:09 | **feat:** Add Phase 1-3 features (Analytics, Live Timing, Engagement) |
| `42b6f26` | 13:48 | **feat:** Wire up Welcome email trigger |
| `8fb7d8c` | 14:17 | **feat:** Enhance profile page |
| `7bc612a` | 14:27 | **refactor:** Robust Home Page Architecture (SSR) |
| `6f9833c` | 14:34 | **feat:** Add analytics dummy data preview |

---

## 📧 Version 2.4.5 — Email & Backend Overhaul
**Released:** January 21, 2026 | **Commits:** 6

| Commit | Time | Description |
|:-------|:-----|:------------|
| `f73d42e` | 11:52 | **feat(backend):** Implement ALL planned features — complete backend overhaul |
| `3819343` | 11:41 | **feat(backend):** Implement Resend SMTP email service with feedback system |
| `0366e98` | 11:24 | **docs:** Comprehensive README + CODEBASE refresh, Developer Identity modal |
| `70b7248` | 10:00 | **feat:** Implement strategic AdSense placements across 6 pages |
| `8971157` | 09:05 | **fix:** Resolve UI layout overlap, improve prediction deadline styling |
| `8c2d59d` | 08:53 | **feat:** Integrate Vercel Speed Insights, enhance documentation |

---

## 🛡️ Version 2.4 — Copyright Protection
**Released:** January 20, 2026 | **Commits:** 1

| Commit | Time | Description |
|:-------|:-----|:------------|
| `c01014d` | 14:09 | **Add:** Copyright protection, "Unofficial Fan Project" badge, update contact info |

---

## 🎨 Version 2.3 — Modern Telemetry
**Released:** January 16, 2026 | **Commits:** 16

### 🌟 UI/UX Overhaul
| Commit | Time | Description |
|:-------|:-----|:------------|
| `a9739f8` | 12:14 | **feat(ui):** Complete modern telemetry design overhaul |
| `c20b29c` | 12:29 | **docs:** Upgrade README and add technical documentation |
| `d19f585` | 12:53 | **feat(analytics):** Integrate Vercel Web Analytics |
| `396e67f` | 12:58 | **perf(ui):** Optimize telemetry loader boot sequence |

### 🧭 Navigation & Profile
| Commit | Time | Description |
|:-------|:-----|:------------|
| `28e608e` | 20:24 | **UI Refinement:** Add Friends and Admin links to Navbar and MobileMenu |
| `063ffde` | 20:32 | **Feature:** Add Predictions History (Mission Logs) page and Profile link |
| `baaa0dd` | 10:20 | **fix:** Navbar fetches correct profile for each logged-in user |
| `c93d3ab` | 10:28 | **fix:** Decoupled team and driver selection — independent dropdowns |
| `ff8d655` | 10:36 | **perf:** Optimize Dashboard loading — load stats in background |

### 🏷️ Logo & Branding
| Commit | Time | Description |
|:-------|:-----|:------------|
| `76fb3b4` | 09:44 | **Feature:** Integrate premium F1 Apex Predictions logo with glow effects |
| `8c41df4` | 09:46 | **fix:** Proper logo sizing for navbar — clean professional appearance |
| `891bcd9` | 09:48 | **Feature:** Premium circular logo with gradient glow ring |
| `8ce0df9` | 09:49 | **fix:** Crisp sharp logo without blur — better contrast |
| `d3a2454` | 09:50 | **fix:** Simple clean logo display — natural proportions |
| `5087d51` | 09:54 | **Feature:** Properly integrated circular logo with F1 APEX brand text |

### 🔐 Auth Improvements
| Commit | Time | Description |
|:-------|:-----|:------------|
| `4aaf84f` | 10:40 | **fix:** Robust auth callback handling for password resets and magic links |
| `544f007` | 11:35 | **fix:** Remove conflicting auth callback page |

---

## 📦 Version 2.2 — Stability Release
**Released:** January 16, 2026 | **Commits:** 21

### 🏗️ Major Restructure
| Commit | Time | Description |
|:-------|:-----|:------------|
| `842b0e5` | 09:05 | **MAJOR:** Restructure project — Next.js at root level for Vercel deployment |
| `cdc8b90` | 09:07 | **fix:** Add missing lib directory (config.ts, api.ts) |
| `4e2c4dc` | 09:13 | **fix:** Remove duplicate frontend directory causing conflicts |
| `2d26f94` | 09:16 | **fix:** Add missing public directory |
| `6188f71` | 09:21 | **Add:** F1 Apex logo |

### 🔧 Deployment Fixes
| Commit | Time | Description |
|:-------|:-----|:------------|
| `0a55813` | 08:27 | **Fix:** Restore root package.json for Vercel deployment |
| `063fef4` | 08:28 | **Fix:** Remove frontend lockfile to fix lightningcss on Vercel |
| `24b1f28` | 08:32 | **Fix:** Downgrade Tailwind to v3 for Vercel compatibility |
| `ec6de79` | 08:34 | **Fix:** Force clean node_modules install to bypass Vercel cache |
| `2cf3a0d` | 08:42 | **Fix:** Remove workspaces, pin exact Tailwind v3.4.17 — FINAL |
| `cff7304` | 08:51 | **Fix:** TypeScript errors in profile page — proper type assertions |
| `e98a8c2` | 08:57 | **Fix:** Complete Vercel deployment config rewrite |
| `ff62906` | 08:59 | **Fix:** Remove invalid Python runtime config |
| `8b02f4f` | 09:00 | **Fix:** Separate install/build commands |
| `9f7625e` | 09:08 | **Fix:** Set correct outputDirectory to .next |
| `3512c44` | 09:11 | **Fix:** Remove deprecated middleware causing MIDDLEWARE_INVOCATION_FAILED |
| `a2b3ac1` | 09:23 | **Fix:** Remove outputDirectory to let Vercel auto-detect |
| `ce3fc75` | 09:28 | **Robust Vercel Fix:** Comprehensive config, fixed API imports, CORS headers |

---

## 🎯 Version 2.1 — Rivalry Release
**Released:** January 15, 2026 | **Commits:** 9

| Commit | Time | Description |
|:-------|:-----|:------------|
| `c3690a1` | 22:00 | **Production Release:** Rivalry Details, Profile Access, Backend Strong Typing [v2.4] |
| `b085764` | 22:04 | **Fix Vercel:** Add Root Package.json with Workspaces |
| `efec489` | 22:05 | **Fix TypeScript:** Profile Null Check and Email Property |
| `db94a38` | 22:12 | **Fix Vercel Build:** Move .next and public artifacts to root |
| `58ce677` | 22:14 | **Security Patch:** Update Next.js to latest version |
| `428c070` | 22:20 | **Fix TypeScript:** Implicit any error in RivalryCard |
| `3b0835f` | 22:25 | **Fix Build:** Move Team Radio animations to global CSS |
| `9822d39` | 22:28 | **Fix Build:** Remove styled-jsx from TelemetryLoader |

---

## 🐛 Version 2.0 — Production Ready
**Released:** January 14-15, 2026 | **Commits:** 20

### 🔧 API & Backend Fixes
| Commit | Time | Description |
|:-------|:-----|:------------|
| `979357b` | 13:13 | **fix:** Single-file FastAPI impl to eliminate import issues on Vercel |
| `34a6ca2` | 13:18 | **debug:** Ultra-minimal FastAPI to test Vercel Python runtime |
| `3eeb27d` | 13:25 | **debug:** ABSOLUTE minimal FastAPI — just 2 routes, no middleware |
| `ee686a4` | 13:28 | **fix:** Use Vercel rewrites config instead of legacy routes |
| `bfb8be1` | 12:53 | **fix:** Restructure for Vercel Python — use api/index.py entry point |
| `5fd14cc` | 13:00 | **fix:** Complete Vercel restructure — move all Python to /api |
| `c75b0c0` | 13:10 | **fix:** Use absolute imports with sys.path for Vercel compatibility |

### 🌐 Frontend Fixes
| Commit | Time | Description |
|:-------|:-----|:------------|
| `9330d30` | 11:47 | **fix:** Refactor frontend to use centralized config |
| `2fe9ee0` | 11:53 | **fix:** Production network errors (relative api path, lax cors) |
| `d370c66` | 12:29 | **feat:** Robust API client infrastructure fixing Safari fetch errors |
| `355f712` | 12:08 | **fix:** Sanitize headers and URL to prevent DOMException on Safari |
| `d21309a` | 12:16 | **fix:** Robust URL construction and strict header sanitization |
| `e7146f7` | 12:19 | **fix:** Simplified robust header cleaning for Safari |

### 🔐 Supabase Fixes
| Commit | Time | Description |
|:-------|:-----|:------------|
| `ca93348` | 12:44 | **fix:** Defensive Supabase init to prevent Vercel cold start crash |
| `907c8de` | 12:38 | **fix:** Remove duplicate return statement crashing Vercel |

---

## 🌱 Version 1.0 — Genesis
**Released:** January 10-13, 2026 | **Commits:** 3

| Commit | Time | Description |
|:-------|:-----|:------------|
| `c989077` | Jan 10, 23:37 | **Initial commit** of F1 Predictor project |
| `f528998` | Jan 13, 17:10 | **Prepare for Vercel deployment:** Add vercel.json and fix build errors |
| `d18702b` | Jan 13, 17:21 | **Fix Vercel 404:** Remove standalone output and update routes |

---

## 📊 Statistics

```
┌─────────────────────────────────────────────────────────┐
│                    PROJECT METRICS                      │
├─────────────────────────────────────────────────────────┤
│  Total Commits:          93                             │
│  Development Period:     12 days (Jan 10-21, 2026)      │
│  Major Releases:         8 versions                     │
│  Contributors:           1 (Yash Abhichandani)          │
│  Primary Languages:      TypeScript, Python, CSS        │
│  Lines of Code:          ~15,000+                       │
├─────────────────────────────────────────────────────────┤
│                   COMMIT BREAKDOWN                      │
├─────────────────────────────────────────────────────────┤
│  🐛 Bug Fixes:           ~45 commits                    │
│  ✨ Features:            ~25 commits                    │
│  📚 Documentation:       ~10 commits                    │
│  🔧 Configuration:       ~8 commits                     │
│  🎨 UI/Styling:          ~5 commits                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔮 How to Update This Log

When pushing new changes, add entries to the appropriate version section:

```markdown
| `abc1234` | HH:MM | **type:** Description of change |
```

**Commit types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `style:` — Formatting, styling
- `refactor:` — Code restructure
- `perf:` — Performance improvement
- `chore:` — Maintenance

---

<div align="center">

**Maintained by [Yash Abhichandani](https://github.com/Yash-Abhichandani)**

*Last updated: January 21, 2026*

</div>
