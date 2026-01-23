"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  getLiveIntervals, 
  getLivePositions, 
  getSessionDrivers, 
  isSessionLive,
  getGhostRaceData,
  OpenF1Driver,
  OpenF1Session
} from "../services/openf1";
import { TEAM_COLORS } from "../lib/drivers";

// ============== TYPES ==============

export interface LiveDriver {
  position: number;
  driverCode: string;
  team: string;
  teamColor: string;
  gap: string;
  interval: string;
  tire: "S" | "M" | "H" | "I" | "W";
  sector1?: "purple" | "green" | "yellow";
  sector2?: "purple" | "green" | "yellow";
  sector3?: "purple" | "green" | "yellow";
}

export interface UseLiveTimingResult {
  drivers: LiveDriver[];
  isLive: boolean;
  isDemoMode: boolean;
  session: OpenF1Session | null;
  lap: number;
  totalLaps: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ============== CONSTANTS ==============

const POLL_INTERVAL_MS = 10000; // 10 seconds for live data
const DEMO_UPDATE_INTERVAL_MS = 3000; // 3 seconds for demo mode

// Driver number to code mapping (2025 grid)
const DRIVER_MAP: Record<number, { code: string; team: string }> = {
  1: { code: "VER", team: "Red Bull Racing" },
  44: { code: "HAM", team: "Ferrari" },
  4: { code: "NOR", team: "McLaren" },
  81: { code: "PIA", team: "McLaren" },
  16: { code: "LEC", team: "Ferrari" },
  63: { code: "RUS", team: "Mercedes" },
  14: { code: "ALO", team: "Aston Martin" },
  18: { code: "STR", team: "Aston Martin" },
  23: { code: "ALB", team: "Williams" },
  55: { code: "SAI", team: "Williams" },
};

// ============== HOOK ==============

export function useLiveTiming(): UseLiveTimingResult {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [session, setSession] = useState<OpenF1Session | null>(null);
  const [lap, setLap] = useState(42);
  const [totalLaps] = useState(57);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert OpenF1 data to our format
  const processLiveData = useCallback(async () => {
    try {
      const liveCheck = await isSessionLive();
      
      if (liveCheck.live && liveCheck.session) {
        // LIVE MODE - Fetch real data
        setIsLive(true);
        setIsDemoMode(false);
        setSession(liveCheck.session);
        
        const [intervals, sessionDrivers] = await Promise.all([
          getLiveIntervals("latest"),
          getSessionDrivers("latest")
        ]);
        
        // Build driver map from session data
        const driverMap = new Map<number, OpenF1Driver>();
        sessionDrivers.forEach(d => driverMap.set(d.driver_number, d));
        
        // Get latest interval for each driver
        const latestIntervals = new Map<number, typeof intervals[0]>();
        intervals.forEach(i => latestIntervals.set(i.driver_number, i));
        
        // Build driver list
        const liveDrivers: LiveDriver[] = Array.from(latestIntervals.entries())
          .map(([num, interval]) => {
            const driverInfo = driverMap.get(num);
            return {
              position: 0, // Will be sorted by gap
              driverCode: driverInfo?.name_acronym || `D${num}`,
              team: driverInfo?.team_name || "Unknown",
              teamColor: driverInfo?.team_colour ? `#${driverInfo.team_colour}` : "#666",
              gap: interval.gap_to_leader ? `+${interval.gap_to_leader.toFixed(1)}s` : "Leader",
              interval: interval.interval ? `+${interval.interval.toFixed(1)}s` : "-",
              tire: "M" as const, // Would need stints API for real data
            };
          })
          .sort((a, b) => {
            if (a.gap === "Leader") return -1;
            if (b.gap === "Leader") return 1;
            return parseFloat(a.gap) - parseFloat(b.gap);
          })
          .map((d, i) => ({ ...d, position: i + 1 }));
        
        setDrivers(liveDrivers.slice(0, 10));
      } else {
        // DEMO MODE - Use ghost race data
        setIsLive(false);
        setIsDemoMode(true);
        setSession(null);
        
        const ghostData = getGhostRaceData();
        setDrivers(ghostData.map(d => ({
          position: d.position,
          driverCode: d.driver_code,
          team: d.team,
          teamColor: TEAM_COLORS[d.team] || "#666",
          gap: d.gap,
          interval: d.interval,
          tire: d.tire as "S" | "M" | "H" | "I" | "W",
          sector1: Math.random() > 0.7 ? "purple" : Math.random() > 0.4 ? "green" : "yellow",
          sector2: Math.random() > 0.7 ? "purple" : Math.random() > 0.4 ? "green" : "yellow",
          sector3: Math.random() > 0.7 ? "purple" : Math.random() > 0.4 ? "green" : "yellow",
        })));
      }
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("[useLiveTiming] Error:", err);
      setError("Failed to fetch timing data");
      setLoading(false);
      
      // Fallback to demo mode on error
      setIsDemoMode(true);
      setIsLive(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    processLiveData();
    
    const interval = setInterval(
      processLiveData, 
      isLive ? POLL_INTERVAL_MS : DEMO_UPDATE_INTERVAL_MS
    );
    
    return () => clearInterval(interval);
  }, [processLiveData, isLive]);

  // Demo mode lap counter
  useEffect(() => {
    if (!isDemoMode) return;
    
    const lapInterval = setInterval(() => {
      setLap(prev => prev >= totalLaps ? 1 : prev + 1);
    }, 15000); // New lap every 15 seconds in demo
    
    return () => clearInterval(lapInterval);
  }, [isDemoMode, totalLaps]);

  return {
    drivers,
    isLive,
    isDemoMode,
    session,
    lap,
    totalLaps,
    loading,
    error,
    refetch: processLiveData
  };
}
