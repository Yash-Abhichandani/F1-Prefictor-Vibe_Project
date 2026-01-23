/**
 * OpenF1 Live Timing Service
 * 
 * Real-time race data from OpenF1 API.
 * Includes "Ghost Race" replay mode for when no session is active.
 */

const OPENF1_BASE = "https://api.openf1.org/v1";

// ============== TYPES ==============

export interface OpenF1Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface OpenF1Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url?: string;
  country_code: string;
  session_key: number;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  location: string;
  country_name: string;
  circuit_short_name: string;
}

// ============== API FUNCTIONS ==============

/**
 * Get the latest session info.
 */
export async function getLatestSession(): Promise<OpenF1Session | null> {
  try {
    const res = await fetch(`${OPENF1_BASE}/sessions?session_key=latest`, {
      cache: 'no-store' // Always fresh for live data
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data?.[0] || null;
  } catch (error) {
    console.error("[OpenF1] getLatestSession error:", error);
    return null;
  }
}

/**
 * Get live intervals (gaps between drivers).
 */
export async function getLiveIntervals(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Interval[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    
    return await res.json();
  } catch (error) {
    console.error("[OpenF1] getLiveIntervals error:", error);
    return [];
  }
}

/**
 * Get current positions.
 */
export async function getLivePositions(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Position[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/position?session_key=${sessionKey}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    
    return await res.json();
  } catch (error) {
    console.error("[OpenF1] getLivePositions error:", error);
    return [];
  }
}

/**
 * Get driver info for a session.
 */
export async function getSessionDrivers(sessionKey: number | 'latest' = 'latest'): Promise<OpenF1Driver[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}`, {
      next: { revalidate: 300 } // 5 min cache for driver info
    });
    
    if (!res.ok) return [];
    
    return await res.json();
  } catch (error) {
    console.error("[OpenF1] getSessionDrivers error:", error);
    return [];
  }
}

/**
 * Check if there's an active live session.
 */
export async function isSessionLive(): Promise<{ live: boolean; session: OpenF1Session | null }> {
  const session = await getLatestSession();
  
  if (!session) return { live: false, session: null };
  
  const now = new Date();
  const start = new Date(session.date_start);
  const end = new Date(session.date_end);
  
  // Add 30 min buffer after end time
  const endWithBuffer = new Date(end.getTime() + 30 * 60 * 1000);
  
  return {
    live: now >= start && now <= endWithBuffer,
    session
  };
}

// ============== GHOST RACE DATA ==============
// Static data for demo mode when no live session

export const GHOST_RACE_DATA = [
  { position: 1, driver_code: "VER", team: "Red Bull Racing", gap: "Leader", interval: "-", tire: "M" },
  { position: 2, driver_code: "NOR", team: "McLaren", gap: "+2.1s", interval: "+2.1s", tire: "M" },
  { position: 3, driver_code: "LEC", team: "Ferrari", gap: "+5.4s", interval: "+3.3s", tire: "H" },
  { position: 4, driver_code: "HAM", team: "Ferrari", gap: "+8.2s", interval: "+2.8s", tire: "H" },
  { position: 5, driver_code: "PIA", team: "McLaren", gap: "+12.1s", interval: "+3.9s", tire: "M" },
  { position: 6, driver_code: "RUS", team: "Mercedes", gap: "+15.6s", interval: "+3.5s", tire: "H" },
  { position: 7, driver_code: "SAI", team: "Williams", gap: "+21.3s", interval: "+5.7s", tire: "M" },
  { position: 8, driver_code: "ALO", team: "Aston Martin", gap: "+24.8s", interval: "+3.5s", tire: "H" },
];

/**
 * Get ghost race data with simulated variations.
 * Used when no live session is active.
 */
export function getGhostRaceData() {
  return GHOST_RACE_DATA.map((driver, index) => ({
    ...driver,
    // Add slight randomization to gaps for visual interest
    gap: index === 0 ? "Leader" : `+${(parseFloat(driver.gap.replace('+', '').replace('s', '')) + (Math.random() * 0.3 - 0.15)).toFixed(1)}s`
  }));
}
