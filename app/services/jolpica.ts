/**
 * Jolpica-F1 API Service Layer
 * 
 * Centralized data fetching for F1 schedule, standings, and results.
 * All calls are cached to prevent rate limiting.
 */

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

// ============== TYPES ==============

export interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  FirstPractice?: { date: string; time: string };
  SecondPractice?: { date: string; time: string };
  ThirdPractice?: { date: string; time: string };
  Qualifying?: { date: string; time: string };
  Sprint?: { date: string; time: string };
}

export interface JolpicaDriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructors: {
    constructorId: string;
    name: string;
    nationality: string;
  }[];
}

export interface JolpicaConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

export interface JolpicaResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  status: string;
  Time?: { millis: string; time: string };
  FastestLap?: { rank: string; lap: string; Time: { time: string } };
}

// ============== API FUNCTIONS ==============

/**
 * Get the next scheduled race.
 * Cache: 1 hour (schedule rarely changes)
 */
export async function getNextRace(): Promise<JolpicaRace | null> {
  try {
    const res = await fetch(`${JOLPICA_BASE}/current/next.json`, {
      next: { revalidate: 3600 } // 1 hour cache
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const races = data.MRData?.RaceTable?.Races;
    
    if (races && races.length > 0) {
      return races[0];
    }
    return null;
  } catch (error) {
    console.error("[Jolpica] getNextRace error:", error);
    return null;
  }
}

/**
 * Get all races in the current season.
 * Cache: 1 hour
 */
export async function getSeasonSchedule(): Promise<JolpicaRace[]> {
  try {
    const res = await fetch(`${JOLPICA_BASE}/current.json`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.MRData?.RaceTable?.Races || [];
  } catch (error) {
    console.error("[Jolpica] getSeasonSchedule error:", error);
    return [];
  }
}

/**
 * Get current driver standings.
 * Cache: 5 minutes (can change after races)
 */
export async function getDriverStandings(): Promise<JolpicaDriverStanding[]> {
  try {
    // Try current season first
    const res = await fetch(`${JOLPICA_BASE}/current/driverStandings.json`, {
      next: { revalidate: 300 } // 5 min cache
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    if (res.ok) {
       data = await res.json();
    }
    
    let standing = data.MRData?.StandingsTable?.StandingsLists?.[0];

    // If no current standings, fallback to 2025
    if (!standing?.DriverStandings?.length) {
       const res2025 = await fetch(`${JOLPICA_BASE}/2025/driverStandings.json`, {
         next: { revalidate: 300 }
       });
       if (res2025.ok) {
         data = await res2025.json();
         standing = data.MRData?.StandingsTable?.StandingsLists?.[0];
       }
    }
    
    return standing?.DriverStandings || [];
  } catch (error) {
    console.error("[Jolpica] getDriverStandings error:", error);
    return [];
  }
}

/**
 * Get current constructor standings.
 * Cache: 5 minutes
 */
export async function getConstructorStandings(): Promise<JolpicaConstructorStanding[]> {
  try {
    // Try current season first
    const res = await fetch(`${JOLPICA_BASE}/current/constructorStandings.json`, {
      next: { revalidate: 300 }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    if (res.ok) {
      data = await res.json();
    }
    
    let standing = data.MRData?.StandingsTable?.StandingsLists?.[0];

    // Fallback to 2025 if empty
    if (!standing?.ConstructorStandings?.length) {
        const res2025 = await fetch(`${JOLPICA_BASE}/2025/constructorStandings.json`, {
            next: { revalidate: 300 }
        });
        if (res2025.ok) {
            data = await res2025.json();
            standing = data.MRData?.StandingsTable?.StandingsLists?.[0];
        }
    }
    
    return standing?.ConstructorStandings || [];
  } catch (error) {
    console.error("[Jolpica] getConstructorStandings error:", error);
    return [];
  }
}

/**
 * Get results for a specific race round.
 * Cache: 1 hour (results don't change after race)
 */
export async function getRaceResults(round: number | string): Promise<JolpicaResult[]> {
  try {
    const res = await fetch(`${JOLPICA_BASE}/current/${round}/results.json`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const race = data.MRData?.RaceTable?.Races?.[0];
    
    return race?.Results || [];
  } catch (error) {
    console.error("[Jolpica] getRaceResults error:", error);
    return [];
  }
}

/**
 * Get the last completed race results.
 * Cache: 5 minutes (may need refresh post-race)
 */
export async function getLastRaceResults(): Promise<{ race: JolpicaRace | null; results: JolpicaResult[] }> {
  try {
    // Try current season last race
    const res = await fetch(`${JOLPICA_BASE}/current/last/results.json`, {
      next: { revalidate: 300 }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    if (res.ok) {
       data = await res.json();
    }
    
    let race = data.MRData?.RaceTable?.Races?.[0];

    // Fallback to 2025 last race if no current results
    if (!race) {
        const res2025 = await fetch(`${JOLPICA_BASE}/2025/last/results.json`, {
            next: { revalidate: 300 }
        });
        if (res2025.ok) {
            data = await res2025.json();
            race = data.MRData?.RaceTable?.Races?.[0];
        }
    }
    
    return {
      race: race || null,
      results: race?.Results || []
    };
  } catch (error) {
    console.error("[Jolpica] getLastRaceResults error:", error);
    return { race: null, results: [] };
  }
}

/**
 * Get qualifying results for a specific race.
 * Cache: 1 hour
 */
export async function getQualifyingResults(round: number | string): Promise<any[]> {
  try {
    const res = await fetch(`${JOLPICA_BASE}/current/${round}/qualifying.json`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const race = data.MRData?.RaceTable?.Races?.[0];
    
    return race?.QualifyingResults || [];
  } catch (error) {
    console.error("[Jolpica] getQualifyingResults error:", error);
    return [];
  }
}

// ============== HELPER FUNCTIONS ==============

/**
 * Convert race datetime to JavaScript Date object.
 */
export function getRaceDateTime(race: JolpicaRace): Date | null {
  if (!race.date) return null;
  
  const dateStr = race.time 
    ? `${race.date}T${race.time}`
    : `${race.date}T14:00:00Z`; // Default to 2pm UTC if no time
    
  return new Date(dateStr);
}

/**
 * Check if a race is currently live (within race window).
 */
export function isRaceLive(race: JolpicaRace): boolean {
  const raceTime = getRaceDateTime(race);
  if (!raceTime) return false;
  
  const now = new Date();
  const twoHoursAfter = new Date(raceTime.getTime() + 2 * 60 * 60 * 1000);
  
  return now >= raceTime && now <= twoHoursAfter;
}

/**
 * Get short driver code (3 letters) from full name.
 */
export function getDriverCode(driver: { givenName: string; familyName: string; code?: string }): string {
  return driver.code || driver.familyName.substring(0, 3).toUpperCase();
}
