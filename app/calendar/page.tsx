"use client";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { TEAMS_2026, TEAM_COLORS } from "../lib/drivers";
import LaunchSequence from "../components/LaunchSequence";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import AdUnit from "../components/AdUnit";
import CircuitGuide from "../components/CircuitGuide";
import TrackMap from "../components/TrackMap";
import { CIRCUIT_DETAILS } from "../lib/circuitDetails";


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

// Map race names to country codes and regions
// Race Name to Code Mapper
const getRaceCode = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("australian")) return "AUS";
  if (n.includes("bahrain")) return "BHR";
  if (n.includes("saudi")) return "SAU";
  if (n.includes("japanese")) return "JPN";
  if (n.includes("chinese")) return "CHN";
  if (n.includes("miami")) return "MIA";
  if (n.includes("emilia") || n.includes("imola")) return "EMI"; // Emilia Romagna
  if (n.includes("monaco")) return "MCO";
  if (n.includes("spanish") || n.includes("spain") || n.includes("catalunya")) return "ESP";
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

const getRaceRegion = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bahrain") || n.includes("saudi") || n.includes("qatar") || n.includes("abu dhabi")) return "Middle East";
  if (n.includes("australian") || n.includes("japanese") || n.includes("chinese") || n.includes("singapore")) return "Asia Pacific";
  if (n.includes("monaco") || n.includes("emilia") || n.includes("spanish") || n.includes("british") || n.includes("belgian") || n.includes("dutch") || n.includes("hungarian") || n.includes("austrian") || n.includes("italian") || n.includes("madrid") || n.includes("azerbaijan") || n.includes("imola")) return "Europe";
  if (n.includes("miami") || n.includes("canadian") || n.includes("united states") || n.includes("austin") || n.includes("mexico") || n.includes("brazil") || n.includes("las vegas")) return "Americas";
  return "Other";
};



import { getSeasonSchedule } from "../services/jolpica";

export default function CalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'timeline' | 'teams'>('timeline');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const data = await getSeasonSchedule();
        const mappedRaces: Race[] = data.map((r: any) => ({
             id: Number(r.round),
             name: r.raceName,
             circuit: r.Circuit.circuitName,
             race_time: `${r.date}T${r.time || "14:00:00Z"}`,
             quali_time: r.Qualifying ? `${r.Qualifying.date}T${r.Qualifying.time}` : undefined,
             is_sprint_weekend: !!r.Sprint
        }));
        setRaces(mappedRaces);
      } catch (e) {
          console.error("Failed to fetch schedule", e);
      }
      setLoading(false);
    };
    fetchRaces();
  }, []);

  const nextRace = races.find(r => new Date(r.race_time) > new Date());
  const pastRaces = races.filter(r => new Date(r.race_time) < new Date());
  const upcomingRaces = races.filter(r => new Date(r.race_time) >= new Date());
  const nextRaceIndex = nextRace ? races.findIndex(r => r.id === nextRace.id) : 0;
  const seasonProgress = races.length > 0 ? Math.round((pastRaces.length / races.length) * 100) : 0;
  
  const regions = ['All', 'Europe', 'Middle East', 'Americas', 'Asia Pacific'];
  const filteredRaces = regionFilter === 'All' 
    ? races 
    : races.filter(r => getRaceRegion(r.name) === regionFilter);
  
  // Auto-scroll to next race
  useEffect(() => {
    if (!loading && timelineRef.current && nextRace) {
      const nextRaceCard = document.getElementById(`race-${nextRace.id}`);
      if (nextRaceCard) {
        nextRaceCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [loading, nextRace]);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Racing stripe */}
      <div className="fixed top-0 left-0 w-2 h-full bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--accent-cyan)]/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">

        {/* === HEADER === */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <PageHeader 
                title="Race Calendar" 
                highlight="2026" 
                badgeText="Season Overview" 
                badgeVariant="cyan"
                description={`${races.length || "?"} Grands Prix • ${pastRaces.length} Completed • ${upcomingRaces.length} Remaining`}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 p-1 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)]">
              <button
                onClick={() => setView('timeline')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  view === 'timeline' 
                    ? 'bg-[var(--accent-gold)] text-black' 
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                📅 Races
              </button>
              <button
                onClick={() => setView('teams')}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  view === 'teams' 
                    ? 'bg-[var(--accent-gold)] text-black' 
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                🏎️ Teams & Drivers
              </button>
            </div>
          </div>

          {/* Season Progress Bar */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Season Progress</span>
                {nextRace && (
                  <span className="badge badge-gold text-xs">Round {nextRaceIndex + 1} Next</span>
                )}
              </div>
              <span className="text-lg font-bold text-[var(--accent-cyan)] font-mono">{seasonProgress}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-graphite)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-gold)] to-[var(--f1-red)] rounded-full transition-all duration-1000"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--text-subtle)]">
              <span>Australia</span>
              <span>Abu Dhabi</span>
            </div>
          </GlassCard>
        </div>

        {loading ? (
           <div className="py-20">
              <LoadingSpinner message="Loading Calendar..." />
           </div>
        ) : (
          <>
            {/* === FEATURED NEXT RACE === */}
            {nextRace && view === 'timeline' && (
              <div className="mb-10">
                <GlassCard variant="gold" className="p-8 md:p-10 relative overflow-hidden">
                  {/* Racing stripe pattern */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--f1-red)] via-[var(--accent-gold)] to-[var(--accent-cyan)]" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="gold" icon="⭐">Next Race</Badge>
                        <Badge variant="cyan">Round {nextRaceIndex + 1}</Badge>
                        {nextRace.is_sprint_weekend && <Badge variant="red">Sprint Weekend</Badge>}
                      </div>
                      
                      {/* LARGE GP NAME */}
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-1 tracking-tight">
                        {nextRace.name.replace(' Grand Prix', '')}
                      </h2>
                      <div className="text-xl md:text-2xl font-semibold text-[var(--accent-gold)] mb-6">
                        GRAND PRIX
                      </div>
                      
                      {/* Circuit Data Grid (Monospace) */}
                      <div className="grid grid-cols-3 gap-4 mb-6 border-t border-white/10 pt-4">
                          <div>
                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Length</div>
                              <div className="text-lg font-mono text-white font-bold">{CIRCUIT_DETAILS[getRaceCode(nextRace.name)]?.lengthKM || "5.4"}KM</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Laps</div>
                              <div className="text-lg font-mono text-white font-bold">{CIRCUIT_DETAILS[getRaceCode(nextRace.name)]?.laps || "57"}</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Record</div>
                              <div className="text-lg font-mono text-[var(--accent-gold)] font-bold">{CIRCUIT_DETAILS[getRaceCode(nextRace.name)]?.lapRecord?.time || "1:31.09"}</div>
                          </div>
                      </div>

                      {/* Countdown */}
                      {nextRace.quali_time && (
                        <div className="mb-8">
                          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">Predictions Close In</div>
                          <LaunchSequence targetTime={nextRace.quali_time} label="" />
                        </div>
                      )}

                      {/* CTA */}
                      <F1Button 
                        href={`/predict/${nextRace.id}`}
                        variant="primary"
                        className="hover:scale-105 shadow-[var(--shadow-glow-red)] text-lg px-8 py-4"
                        icon="🏎️"
                      >
                        MAKE PREDICTIONS →
                      </F1Button>
                    </div>

                    {/* Track Outline */}
                    <div className="hidden lg:block">
                      <div className="w-64 h-64 relative">
                        <TrackMap 
                          code={getRaceCode(nextRace.name)} 
                          variant="gold" 
                          className="scale-125"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-9xl font-black text-white/20 font-display tracking-tighter select-none">
                            {getRaceCode(nextRace.name)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </GlassCard>
              </div>
            )}

            {/* === TIMELINE VIEW === */}
            {view === 'timeline' && (
              <div>
                {/* Region Filter Tabs */}
                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                  <span className="text-xs text-[var(--text-subtle)] uppercase tracking-wider whitespace-nowrap">Filter:</span>
                  {regions.map(region => (
                    <button
                      key={region}
                      onClick={() => setRegionFilter(region)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                        regionFilter === region
                          ? 'bg-[var(--accent-cyan)] text-black'
                          : 'bg-[var(--bg-onyx)] text-[var(--text-muted)] hover:text-white border border-[var(--glass-border)]'
                      }`}
                    >
                      {region} {region !== 'All' && `(${races.filter(r => getRaceRegion(r.name) === region).length})`}
                    </button>
                  ))}
                </div>

                {/* Race Cards Grid */}
                <div 
                  ref={timelineRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {filteredRaces.map((race, index) => {
                    const isPast = new Date(race.race_time) < new Date();
                    const isNext = nextRace?.id === race.id;
                    const raceCode = getRaceCode(race.name);
                    const raceIndex = races.findIndex(r => r.id === race.id) + 1;
                    const details = CIRCUIT_DETAILS[raceCode];
                    
                    return (
                      <Link
                        key={race.id}
                        id={`race-${race.id}`}
                        href={isPast ? `/submissions/${race.id}` : `/predict/${race.id}`}
                        className={`group relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col
                          ${isNext 
                            ? 'border-[var(--accent-gold)] bg-[var(--bg-midnight)] shadow-[var(--shadow-glow-gold)] ring-1 ring-[var(--accent-gold)]/50' 
                            : isPast 
                            ? 'border-[var(--glass-border)] bg-[var(--bg-onyx)] opacity-70 hover:opacity-100 hover:border-[var(--glass-border-light)]' 
                            : 'border-[var(--glass-border)] bg-[var(--bg-carbon)] hover:border-[var(--accent-cyan)] hover:shadow-[var(--shadow-glow-cyan)] hover:-translate-y-1'
                          }
                        `}
                      >
                        {/* Header: Date & Round */}
                        <div className="flex justify-between items-start p-4 border-b border-[var(--glass-border)] bg-[var(--bg-void)]/30">
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                              {new Date(race.race_time).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`text-xl font-bold font-display tracking-tight ${isNext ? 'text-[var(--accent-gold)]' : 'text-white'}`}>
                              {raceCode}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono text-[var(--text-subtle)]">R{raceIndex.toString().padStart(2, '0')}</span>
                            {/* Live/Next Indicator (Terminal Style) */}
                            {isNext && (
                               <div className="mt-1 px-1.5 py-0.5 bg-[var(--status-warning)]/10 border border-[var(--status-warning)]/50 rounded-[1px]">
                                  <span className="text-[9px] font-mono font-bold text-[var(--status-warning)] tracking-wider blink">[ STATUS: UPCOMING ]</span>
                               </div>
                            )}
                          </div>
                        </div>

                        {/* Map Area */}
                        <div className="h-40 relative p-4 flex items-center justify-center bg-[var(--bg-void)]/20">
                           {/* Grid Background */}
                           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
                           
                           {/* The Map */}
                           <div className="w-full h-full z-10 p-2 transform group-hover:scale-110 transition-transform duration-500">
                              <TrackMap 
                                code={raceCode} 
                                variant={isNext ? 'gold' : isPast ? 'default' : 'cyan'} 
                              />
                           </div>
                        </div>

                        {/* Technical Data Block */}
                        <div className="p-4 grid grid-cols-3 gap-2 border-t border-[var(--glass-border)] bg-[var(--bg-onyx)]/50">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Len</span>
                            <span className="text-xs font-mono text-white">{details?.lengthKM || "-"}km</span>
                          </div>
                          <div className="flex flex-col text-center border-x border-[var(--glass-border)] px-2">
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Laps</span>
                            <span className="text-xs font-mono text-white">{details?.laps || "-"}</span>
                          </div>
                          <div className="flex flex-col text-end">
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Rec</span>
                            <span className="text-xs font-mono text-white">{details?.lapRecord?.time || "-"}</span>
                          </div>
                        </div>

                        {/* Footer / CTA */}
                        {isNext && (
                           <div className="p-3 bg-[var(--accent-gold)] text-black text-center font-bold text-sm tracking-wide uppercase">
                             Enter Strategy
                           </div>
                        )}
                      </Link>
                    );
                  })}

                </div>
              </div>
            )}

            {/* === AD PLACEMENT === */}
            <div className="my-8">
              <AdUnit 
                slot="calendar_grid"
                format="horizontal"
                style={{ minHeight: "90px" }}
                label="Sponsored"
              />
            </div>

            {/* === TEAMS VIEW === */}
            {view === 'teams' && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="badge badge-gold">2026 Grid</span>
                  <span className="text-sm text-[var(--text-muted)]">11 Teams • 22 Drivers</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Object.entries(TEAMS_2026).map(([team, drivers]) => (
                    <GlassCard 
                      key={team}
                      className="group relative overflow-hidden transition-all hover:border-[var(--glass-border-light)]"
                    >
                      {/* Team color accent */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1 opacity-80"
                        style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                      />
                      
                      <div className="p-6">
                        {/* Team Header */}
                        <div className="flex items-center gap-3 mb-6">
                          <div 
                            className="w-1 h-10 rounded-full"
                            style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                          />
                          <div>
                            <h4 className="font-bold text-white">{team}</h4>
                            <p className="text-xs text-[var(--text-muted)]">2026 Season</p>
                          </div>
                        </div>
                        
                        {/* Drivers */}
                        <div className="space-y-3">
                          {drivers.map((d) => (
                            <div 
                              key={d.number}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-graphite)] border border-[var(--glass-border)]"
                            >
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                                style={{ backgroundColor: TEAM_COLORS[team] || '#666' }}
                              >
                                {d.number}
                              </div>
                              <span className="text-sm text-white font-medium">{d.driver}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* === STATS FOOTER === */}
            <div className="mt-16 pt-8 border-t border-[var(--glass-border)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: races.length, label: "Total Races", color: "var(--accent-cyan)" },
                  { value: upcomingRaces.length, label: "Remaining", color: "var(--accent-gold)" },
                  { value: races.filter(r => r.is_sprint_weekend).length, label: "Sprint Weekends", color: "var(--f1-red)" },
                  { value: 11, label: "Teams", color: "white" },
                ].map((stat) => (
                  <GlassCard key={stat.label} className="p-4 text-center">
                    <div className="text-3xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{stat.label}</div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
