# 🎨 F1 Apex — Frontend Specification Document

> **Purpose:** Handoff document for frontend developers  
> **Backend Contact:** Refer to `implementation_plan.md` for API contracts  
> **Last Updated:** January 21, 2026

---

## 📋 Overview

This document specifies all frontend components required for upcoming features. Each section includes:
- Component name and purpose
- Props/state requirements
- API endpoints to integrate
- UI/UX guidelines

---

## 🔧 Phase 1: Quick Wins

### 1.1 Contact/Feedback Form

**Component:** `FeedbackForm.tsx`

**Location:** `app/contact/page.tsx` (existing, needs update)

**Props:**
```typescript
interface FeedbackFormProps {
  userId?: string; // Pre-fill if logged in
  email?: string;
}
```

**API Integration:**
```typescript
POST /api/feedback
Body: { email, name, subject, message, category }
Response: { success: boolean, message: string }
```

**UI Requirements:**
- Form fields: Name, Email, Subject (dropdown), Message
- Categories: General, Bug Report, Feature Request, Other
- Success toast on submit
- Email confirmation display

---

### 1.2 Streak Badge

**Component:** `StreakBadge.tsx`

**Location:** `app/components/` (new component)

**Props:**
```typescript
interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  isOnFire?: boolean; // streak >= 3
}
```

**API Integration:**
```typescript
GET /api/users/{id}/streak
Response: { current_streak, best_streak, multiplier }
```

**UI Requirements:**
- Fire emoji animation when streak >= 3
- Display current streak number
- Tooltip showing best streak and multiplier
- Use existing gold accent color for "on fire" state

---

### 1.3 Prediction Templates

**Component:** `TemplateSelector.tsx`

**Location:** Inside `PredictionForm.tsx`

**Props:**
```typescript
interface TemplateSelectorProps {
  onApply: (positions: DriverPositions) => void;
}

type TemplateType = 'standings' | 'last-race' | 'random' | 'custom';
```

**API Integration:**
```typescript
GET /api/templates                    // List all
GET /api/templates/standings          // Current WDC order
GET /api/templates/last-race          // User's last prediction
POST /api/templates                   // Save custom
```

**UI Requirements:**
- Dropdown with template options
- "Apply" button that fills form
- "Save as Template" option for custom picks
- Clear visual distinction between global and personal templates

---

## 📊 Phase 2: Analytics

### 2.1 Analytics Dashboard

**Component:** `AnalyticsDashboard.tsx`

**Location:** `app/profile/[id]/analytics/page.tsx` (new route)

**Sub-components:**
| Component | Purpose |
|:----------|:--------|
| `AccuracyHeatmap.tsx` | Driver vs. accuracy grid |
| `TrendChart.tsx` | Performance over season |
| `InsightCard.tsx` | "You overrate X by Y positions" |
| `ComparisonWidget.tsx` | Compare vs. another user |

**API Integration:**
```typescript
GET /api/analytics/me
Response: {
  total_predictions: number,
  accuracy_percentage: number,
  accuracy_by_driver: Record<string, number>,
  accuracy_by_circuit: Record<string, number>,
  overrated_drivers: string[],
  underrated_drivers: string[],
  trend_data: { race: string, accuracy: number }[]
}
```

**UI Requirements:**
- Use existing telemetry panel styling
- Heatmap uses team colors for drivers
- Trend chart uses recharts or similar
- Mobile-responsive grid layout

---

### 2.2 Circuit Guide Cards

**Component:** `CircuitGuide.tsx`

**Location:** `app/calendar/page.tsx` (add to race cards)

**Props:**
```typescript
interface CircuitGuideProps {
  circuitId: number;
  showExpanded?: boolean;
}
```

**API Integration:**
```typescript
GET /api/circuits/{id}
Response: {
  name: string,
  country: string,
  drs_zones: number,
  overtaking_difficulty: 'easy' | 'medium' | 'hard',
  lap_record: string,
  historical_winners: { driver: string, year: number }[],
  weather_patterns: { condition: string, probability: number }[]
}
```

**UI Requirements:**
- Collapsible panel on race cards
- DRS zone count with icon
- Overtaking difficulty badge (color-coded)
- Weather probability bars
- "Verstappen dominates here" type insights

---

## 📱 Phase 3: Engagement

### 3.1 Push Notification Preferences

**Component:** `NotificationPreferences.tsx`

**Location:** `app/profile/settings/page.tsx` (new route)

**Props:**
```typescript
interface NotificationPreferencesProps {
  preferences: {
    race_reminders: boolean;
    friend_requests: boolean;
    rivalry_updates: boolean;
    results_announcements: boolean;
    weekly_digest: boolean;
  };
  onUpdate: (prefs: Preferences) => void;
}
```

**API Integration:**
```typescript
GET /api/notifications/preferences
PATCH /api/notifications/preferences
POST /api/notifications/subscribe   // Send push subscription
```

**UI Requirements:**
- Toggle switches for each preference
- "Enable Push Notifications" CTA if not subscribed
- Browser permission request flow
- Service Worker registration

**Service Worker:** Create `public/sw.js` for push handling

---

### 3.2 Shareable Prediction Card

**Component:** `ShareButton.tsx`

**Location:** Add to prediction display components

**Props:**
```typescript
interface ShareButtonProps {
  predictionId: number;
  platform?: 'twitter' | 'whatsapp' | 'copy';
}
```

**API Integration:**
```typescript
GET /api/og/prediction/{id}  // Returns PNG image
GET /api/share/{id}          // Share page with OG meta
```

**UI Requirements:**
- Share icon button
- Dropdown with platform options
- Preview of generated card
- Copy link functionality
- Mobile share API integration

---

### 3.3 Live Timing Tower

**Component:** `LiveTimingTower.tsx`

**Location:** `app/live/page.tsx` (new route)

**Sub-components:**
| Component | Purpose |
|:----------|:--------|
| `PositionRow.tsx` | Single driver row |
| `GapDelta.tsx` | +/- time display |
| `SessionHeader.tsx` | Session type, status |
| `TireIndicator.tsx` | Current compound |

**Props:**
```typescript
interface LiveTimingTowerProps {
  sessionId: number;
}

interface PositionData {
  driver: string;
  position: number;
  gap_to_leader: string;
  last_lap_time: string;
  tire_compound: 'soft' | 'medium' | 'hard' | 'inter' | 'wet';
  pit_stops: number;
}
```

**API Integration:**
```typescript
GET /api/live/current         // Current session info
WS  /api/live/stream          // WebSocket for real-time
```

**UI Requirements:**
- F1 TV-style timing tower layout
- Green/yellow/purple sector colors
- Automatic position animation on update
- Connection status indicator
- Fallback for when no live session

---

## 🎮 Phase 4: Gamification

### 4.1 Fantasy Team Builder

**Component:** `FantasyTeamBuilder.tsx`

**Location:** `app/fantasy/page.tsx` (new route)

**Sub-components:**
| Component | Purpose |
|:----------|:--------|
| `DriverMarket.tsx` | Available drivers with prices |
| `TeamSlots.tsx` | 5 driver slots |
| `BudgetDisplay.tsx` | Remaining budget |
| `TransferWindow.tsx` | Make transfers |

**API Integration:**
```typescript
GET /api/fantasy/drivers      // All drivers with prices
GET /api/fantasy/team         // User's current team
POST /api/fantasy/team        // Create team
POST /api/fantasy/transfer    // Make transfer
GET /api/fantasy/leaderboard  // Fantasy standings
```

**UI Requirements:**
- Drag-and-drop driver selection
- Budget constraint visualization
- Transfer deadline countdown
- Leaderboard with point breakdown
- Driver card with cost and points earned

---

## 🎨 Global UI Updates

### Dark/Light Mode Toggle

**Location:** `app/components/Navbar.tsx`

**Implementation:**
```typescript
// Use existing CSS variables
// Add toggle button
// Persist to localStorage + preferences API
```

**Requirements:**
- Sun/moon icon toggle
- Smooth CSS transition
- Respect system preference initially
- Sync with backend preferences API

---

## 📡 API Error Handling

All components should handle these standard error responses:

```typescript
interface APIError {
  detail: string;
  status_code: number;
}

// Standard error codes
400 - Validation error
401 - Unauthorized
403 - Forbidden
404 - Not found
429 - Rate limited
500 - Server error
```

Use `TeamRadioToast` for error display.

---

## 🧪 Testing Requirements

Each component should have:
- [ ] Unit tests for logic
- [ ] Integration tests for API calls
- [ ] Mobile responsiveness check
- [ ] Accessibility (a11y) compliance
- [ ] Loading state handling
- [ ] Error state handling

---

## 📁 New Files Summary

```
app/
├── analytics/
│   └── page.tsx              # Analytics dashboard
├── contact/
│   └── page.tsx              # (update existing)
├── fantasy/
│   └── page.tsx              # Fantasy team
├── live/
│   └── page.tsx              # Live timing
├── profile/
│   └── settings/
│       └── page.tsx          # Notification settings
├── components/
│   ├── StreakBadge.tsx
│   ├── TemplateSelector.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── AccuracyHeatmap.tsx
│   ├── TrendChart.tsx
│   ├── CircuitGuide.tsx
│   ├── NotificationPreferences.tsx
│   ├── ShareButton.tsx
│   ├── LiveTimingTower.tsx
│   ├── PositionRow.tsx
│   ├── GapDelta.tsx
│   ├── FantasyTeamBuilder.tsx
│   ├── DriverMarket.tsx
│   └── BudgetDisplay.tsx
└── public/
    └── sw.js                  # Service worker
```

---

**Questions?** Refer to backend implementation plan or contact backend team.
