"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PitBoardCard from "../components/PitBoardCard";
import Link from "next/link";
import { TEAMS_2026, TEAM_COLORS } from "../lib/drivers";

interface Race {
  id: number;
  name: string;
  circuit: string;
  race_time: string;
  quali_time?: string;
  fp1_time?: string;
  fp2_time?: string;
  fp3_time?: string;
  sprint_time?: string;
  is_sprint_weekend?: boolean;
}

// Map race names to country codes
const getRaceCode = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("australian")) return "AUS";
  if (n.includes("bahrain")) return "BHR";
  if (n.includes("saudi")) return "SAU";
  if (n.includes("japanese")) return "JPN";
  if (n.includes("chinese")) return "CHN";
  if (n.includes("miami")) return "MIA";
  if (n.includes("emilia") || n.includes("imola")) return "ITA";
  if (n.includes("monaco")) return "MCO";
  if (n.includes("spanish") || n.includes("spain")) return "ESP";
  if (n.includes("canadian") || n.includes("canada")) return "CAN";
  if (n.includes("austrian") || n.includes("austria")) return "AUT";
  if (n.includes("british") || n.includes("silverstone")) return "GBR";
  if (n.includes("hungarian") || n.includes("hungary")) return "HUN";
  if (n.includes("belgian") || n.includes("spa")) return "BEL";
  if (n.includes("dutch") || n.includes("netherlands")) return "NED";
  if (n.includes("italian") || n.includes("monza")) return "ITA";
  if (n.includes("madrid")) return "MAD";
  if (n.includes("azerbaijan") || n.includes("baku")) return "AZE";
  if (n.includes("singapore")) return "SGP";
  if (n.includes("united states") || n.includes("austin")) return "USA";
  if (n.includes("mexico")) return "MEX";
  if (n.includes("brazil") || n.includes("são paulo")) return "BRA";
  if (n.includes("las vegas")) return "LVS";
  if (n.includes("qatar")) return "QAT";
  if (n.includes("abu dhabi")) return "ABU";
  return "GP";
};

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'timeline' | 'teams'>('timeline');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchRaces = async () => {
      const { data } = await supabase
        .from("races")
        .select("*")
        .order("race_time", { ascending: true });
      if (data) setRaces(data);
      setLoading(false);
    };
    fetchRaces();
  }, []);

  const nextRace = races.find(r => new Date(r.race_time) > new Date());
  const pastRaces = races.filter(r => new Date(r.race_time) < new Date());
  const upcomingRaces = races.filter(r => new Date(r.race_time) >= new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0B0C10] to-[#1F2833]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-[var(--alert-red)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="mt-6 font-orbitron text-xl text-[var(--accent-cyan)] tracking-widest animate-pulse">LOADING CALENDAR...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C10] via-[#0d1117] to-[#1a1f2e]">
      
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[var(--accent-cyan)] rounded-full blur-[200px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-[var(--alert-red)] rounded-full blur-[180px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[var(--accent-lime)] rounded-full blur-[150px] opacity-5" />
      </div>

      {/* === HEADER === */}
      <section className="relative z-10 py-12 md:py-16 px-4 border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">🏁</span>
                <div>
                  <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-2">
                    <span className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-lime)] bg-clip-text text-transparent">2026</span> RACE CALENDAR
                  </h1>
                  <p className="font-mono text-[var(--text-silver)] tracking-wide">
                    {races.length} Grand Prix Events • {pastRaces.length} Completed • {upcomingRaces.length} Remaining
                  </p>
                </div>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-[var(--bg-carbon)]/80 backdrop-blur p-1.5 rounded-lg border border-[var(--glass-border)]">
              <button
                onClick={() => setView('timeline')}
                className={`px-5 py-2.5 rounded-md font-orbitron text-sm font-bold transition-all ${
                  view === 'timeline' 
                    ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--success-green)] text-black shadow-lg' 
                    : 'text-[var(--text-silver)] hover:text-white hover:bg-white/5'
                }`}
              >
                📅 RACES
              </button>
              <button
                onClick={() => setView('teams')}
                className={`px-5 py-2.5 rounded-md font-orbitron text-sm font-bold transition-all ${
                  view === 'teams' 
                    ? 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--success-green)] text-black shadow-lg' 
                    : 'text-[var(--text-silver)] hover:text-white hover:bg-white/5'
                }`}
              >
                🏎️ TEAMS & DRIVERS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === NEXT RACE HIGHLIGHT === */}
      {nextRace && view === 'timeline' && (
        <section className="relative z-10 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--success-green)] to-[var(--accent-lime)] rounded-2xl animate-pulse" />
              <div className="absolute inset-[3px] bg-gradient-to-br from-[#0B0C10] to-[#1F2833] rounded-2xl" />
              
              <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--accent-cyan)] rounded-2xl blur-xl opacity-40" />
                    <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-[var(--bg-carbon)] to-[#0B0C10] rounded-2xl border-2 border-[var(--accent-cyan)]">
                      <span className="font-orbitron text-3xl font-black bg-gradient-to-r from-[var(--accent-cyan)] to-white bg-clip-text text-transparent">
                        {getRaceCode(nextRace.name)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success-green)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--success-green)]"></span>
                      </span>
                      <span className="font-mono text-sm text-[var(--success-green)] uppercase tracking-wider font-bold">Next Race Week</span>
                    </div>
                    <h2 className="font-orbitron text-2xl md:text-4xl font-black text-white">{nextRace.name}</h2>
                    <p className="font-mono text-[var(--text-silver)] mt-1">📍 {nextRace.circuit}</p>
                  </div>
                </div>
                
                <Link
                  href={`/predict/${nextRace.id}`}
                  className="group relative px-10 py-5 overflow-hidden rounded-xl font-orbitron font-bold text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--success-green)] to-[var(--accent-cyan)] bg-[length:200%_100%] animate-shimmer" />
                  <span className="relative z-10 text-black flex items-center gap-2">
                    🏎️ MAKE PREDICTIONS
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* === TIMELINE VIEW === */}
      {view === 'timeline' && (
        <section className="relative z-10 py-8 px-4">
          <div className="max-w-[1800px] mx-auto">
            <h3 className="font-orbitron text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-[var(--accent-cyan)] to-transparent rounded-full" />
              GRAND PRIX TIMELINE
              <span className="ml-4 font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-carbon)] px-3 py-1 rounded-full">
                {races.length} EVENTS
              </span>
            </h3>
            
            <div className="telemetry-track pb-4">
              {races.map((race) => {
                const isPast = new Date(race.race_time) < new Date();
                const isActive = nextRace?.id === race.id;
                
                return (
                  <PitBoardCard
                    key={race.id}
                    raceCode={getRaceCode(race.name)}
                    raceName={race.name}
                    circuit={race.circuit}
                    qualiTime={race.quali_time}
                    raceTime={race.race_time}
                    isActive={isActive}
                    isPast={isPast}
                    onClick={() => {
                      if (!isPast) window.location.href = `/predict/${race.id}`;
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* === TEAMS & DRIVERS VIEW === */}
      {view === 'teams' && (
        <section className="relative z-10 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-orbitron text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-[var(--accent-lime)] to-transparent rounded-full" />
              2026 F1 GRID
              <span className="ml-4 font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-carbon)] px-3 py-1 rounded-full">
                11 TEAMS • 22 DRIVERS
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(TEAMS_2026).map(([team, drivers]) => (
                <div 
                  key={team}
                  className="group relative overflow-hidden rounded-2xl"
                >
                  {/* Team color accent */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${TEAM_COLORS[team] || '#666'} 0%, transparent 60%)` }}
                  />
                  
                  <div className="relative bg-[var(--bg-carbon)]/80 backdrop-blur border border-[var(--glass-border)] rounded-2xl p-6 h-full hover:border-white/30 transition-all">
                    {/* Team Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div 
                        className="w-4 h-12 rounded-full"
                        style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                      />
                      <div>
                        <h4 className="font-orbitron font-bold text-white text-lg">{team}</h4>
                        <p className="font-mono text-xs text-[var(--text-muted)]">2026 SEASON</p>
                      </div>
                    </div>
                    
                    {/* Drivers */}
                    <div className="space-y-3">
                      {drivers.map((d) => (
                        <div 
                          key={d.number}
                          className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/5"
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-orbitron font-bold text-white"
                            style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                          >
                            {d.number}
                          </div>
                          <span className="font-mono text-sm text-white font-medium">{d.driver}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Footer */}
      <section className="relative z-10 py-12 px-4 border-t border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: races.length, label: "TOTAL RACES", color: "var(--accent-cyan)" },
            { value: upcomingRaces.length, label: "REMAINING", color: "var(--success-green)" },
            { value: pastRaces.length, label: "COMPLETED", color: "var(--alert-red)" },
            { value: 10, label: "TEAMS", color: "white" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-[var(--bg-carbon)]/50 border border-[var(--glass-border)]">
              <div className="font-orbitron text-4xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-mono text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
