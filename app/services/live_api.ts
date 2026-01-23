import { config } from '@/lib/config';

// Types matching Backend Data Contracts
export interface LiveSession {
  session_key: number;
  session_name: string;
  session_type: string;
  status: 'active' | 'finished';
  circuit_short_name: string;
  country_name: string;
}

export interface TimingDriver {
  position: number;
  driver_number: number;
  driver_code: string;
  team_colour: string;
  gap_to_leader: string | null;
  interval: string | null;
  sector_1: { time: string; status: 'purple' | 'green' | 'yellow' } | null;
  sector_2: { time: string; status: 'purple' | 'green' | 'yellow' } | null;
  pit_status?: string;
}

export interface TelemetryData {
  timestamp: string;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  gear: number;
  drs: number;
}

export interface RadarMetrics {
  driver: string;
  metrics: {
    [key: string]: { value: number; normalized: number };
  };
}

// Live API Service
export const liveApi = {
  // Session Status
  getSession: async (): Promise<LiveSession | null> => {
    try {
      const res = await fetch(`${config.apiUrl}/live/session`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Live Session Fetch Error:', e);
      return null;
    }
  },

  // Timing Tower (Leaderboard)
  getTiming: async (sessionKey?: number): Promise<{ drivers: TimingDriver[] } | null> => {
    try {
      const url = sessionKey 
        ? `${config.apiUrl}/live/timing?session_key=${sessionKey}`
        : `${config.apiUrl}/live/timing`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Live Timing Fetch Error:', e);
      return null;
    }
  },

  // Driver Telemetry (High Freq)
  getTelemetry: async (driverNumber: number, sessionKey?: number): Promise<TelemetryData | null> => {
    try {
      const url = sessionKey
        ? `${config.apiUrl}/live/telemetry/${driverNumber}?session_key=${sessionKey}`
        : `${config.apiUrl}/live/telemetry/${driverNumber}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.telemetry;
    } catch (e) {
      // Suppress logs for high-freq polling errors
      return null;
    }
  },

  // Analytics: Radar Chart
  getRadar: async (year: number, race: string, driver: string): Promise<RadarMetrics | null> => {
    try {
      const res = await fetch(`${config.apiUrl}/analysis/radar/${year}/${race}/${driver}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Radar Analysis Error:', e);
      return null;
    }
  }
};
