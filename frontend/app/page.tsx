"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import LaunchSequence from "./components/LaunchSequence";
import RivalryCard from "./components/RivalryCard";

interface Race {
  id: number;
  name: string;
  circuit: string;
  race_time: string;
  quali_time?: string;
  is_sprint?: boolean;
}

export default function Home() {
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastResults, setLastResults] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [userStandings, setUserStandings] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getRaceWeekendDates = (raceDateIso: string) => {
    if (!raceDateIso) return "TBD";
    const raceDate = new Date(raceDateIso);
    const sunday = new Date(raceDate);
    const friday = new Date(sunday);
    friday.setDate(sunday.getDate() - 2);
    const start = friday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    const end = sunday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
    return `${start} - ${end}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString();
        
        const { data } = await supabase
          .from("races")
          .select("*")
          .gt("race_time", today)
          .order("race_time", { ascending: true })
          .limit(1);

        if (data && data.length > 0) {
          setNextRace(data[0]);
        } else {
          const { data: allRaces } = await supabase
            .from("races")
            .select("*")
            .order("race_time", { ascending: true })
            .limit(1);
          if (allRaces && allRaces.length > 0) {
            setNextRace(allRaces[0]);
          }
        }

        // Live data (F1)
        try {
          const resResults = await fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json");
          const dataResults = await resResults.json();
          if (dataResults.MRData.RaceTable.Races.length > 0) {
            setLastResults(dataResults.MRData.RaceTable.Races[0].Results.slice(0, 3));
          }
        } catch (e) {}

        try {
          const resStandings = await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json");
          const dataStandings = await resStandings.json();
          if (dataStandings.MRData.StandingsTable.StandingsLists.length > 0) {
            setTopDrivers(dataStandings.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5));
          }
        } catch (e) {}
        
        // User Standings (Local API)
        try {
           const resUsers = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/standings`);
           if (resUsers.ok) {
             const dataUsers = await resUsers.json();
             setUserStandings(dataUsers);
           }
        } catch(e) { console.error("Error fetching user standings:", e); }

      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-gunmetal)]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[var(--accent-teal)] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-[var(--signal-red)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="mt-6 font-heading text-xl text-[var(--accent-teal)] tracking-widest animate-pulse">LOADING TELEMETRY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-gunmetal)]">
      
      {/* === HERO SECTION === */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-cyan)] rounded-full blur-[150px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--alert-red)] rounded-full blur-[150px] opacity-15" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Main Title */}
          <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-[var(--accent-cyan)] to-white bg-clip-text text-transparent">
              F1 APEX
            </span>
          </h1>
          <p className="font-mono text-lg md:text-xl text-[var(--text-silver)] mb-8 tracking-wide">
            PREDICT • COMPETE • <span className="text-[var(--accent-cyan)]">DOMINATE</span>
          </p>
          
          {/* Next Race Card */}
          {nextRace && (
            <div className="inline-block mb-10">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--alert-red)] rounded-lg opacity-40 blur group-hover:opacity-60 transition" />
                
                <div className="relative bg-[#0B0C10] border border-[var(--glass-border)] rounded-lg p-6 md:p-8">
                  <div className="text-xs font-mono text-[var(--accent-cyan)] tracking-widest mb-2">
                    NEXT GRAND PRIX
                  </div>
                  <h2 className="font-orbitron text-3xl md:text-4xl font-black text-white mb-2">
                    {nextRace.name}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--text-silver)]">
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--alert-red)]">📍</span> {nextRace.circuit}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--accent-cyan)]">📅</span> {getRaceWeekendDates(nextRace.race_time)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Countdown */}
          {nextRace && (
            <div className="mb-10">
              {nextRace.quali_time ? (
                <LaunchSequence 
                  targetTime={nextRace.quali_time}
                  label="PREDICTIONS CLOSE IN"
                />
              ) : (
                <div className="glass-card p-6 md:p-8 text-center border-2 border-dashed border-[var(--accent-cyan)]/30">
                  <div className="text-xs md:text-sm font-orbitron text-[var(--text-silver)] tracking-[0.3em] uppercase mb-4 opacity-70">
                    PREDICTIONS OPEN
                  </div>
                  <div className="font-orbitron text-2xl md:text-4xl font-bold text-[var(--accent-cyan)] mb-4">
                    🏁 RACE WEEKEND INCOMING
                  </div>
                  <p className="font-mono text-sm text-[var(--text-muted)]">
                    Session times will be confirmed soon
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {nextRace && (
              <Link 
                href={`/predict/${nextRace.id}`}
                className="group relative px-10 py-4 overflow-hidden rounded font-orbitron font-bold text-lg tracking-wider uppercase"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--success-green)] to-[var(--accent-cyan)] bg-[length:200%_100%] animate-shimmer" />
                <span className="relative z-10 text-[#0B0C10]">🏎️ MAKE PREDICTIONS</span>
              </Link>
            )}
            <Link 
              href="/calendar"
              className="px-10 py-4 border-2 border-[var(--accent-cyan)] text-[var(--accent-cyan)] rounded
                font-orbitron font-bold text-lg tracking-wider uppercase
                hover:bg-[var(--accent-cyan)] hover:text-[#0B0C10] transition-all duration-300"
            >
              📅 VIEW CALENDAR
            </Link>
          </div>
        </div>
      </section>

      {/* === DATA PANELS === */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PODIUM CARD */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-gray-400 to-orange-600 rounded-xl opacity-30 blur-sm group-hover:opacity-50 transition" />
            <div className="relative bg-[#0B0C10] border border-[var(--glass-border)] rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🏆</span>
                <h3 className="font-orbitron text-xl font-bold text-white">LAST RACE PODIUM</h3>
              </div>
              
              {lastResults.length > 0 ? (
                <div className="space-y-4">
                  {lastResults.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02]"
                      style={{
                        background: index === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2), transparent)' :
                                   index === 1 ? 'linear-gradient(90deg, rgba(192,192,192,0.2), transparent)' :
                                   'linear-gradient(90deg, rgba(205,127,50,0.2), transparent)'
                      }}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full font-orbitron font-black text-xl ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        'bg-orange-700 text-white'
                      }`}>
                        P{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-orbitron font-bold text-white text-lg">
                          {result.Driver.familyName.toUpperCase()}
                        </div>
                        <div className="font-mono text-sm text-[var(--text-muted)]">
                          {result.Constructor.name}
                        </div>
                      </div>
                      <div className="font-mono text-2xl font-bold text-[var(--accent-cyan)]">
                        +{result.points || 0}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <span className="text-4xl mb-4">🏁</span>
                  <span className="font-mono">No race data yet</span>
                </div>
              )}
            </div>
          </div>
          
          {/* CHAMPIONSHIP CARD */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-lime)] rounded-xl opacity-30 blur-sm group-hover:opacity-50 transition" />
            <div className="relative bg-[#0B0C10] border border-[var(--glass-border)] rounded-xl p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📊</span>
                <h3 className="font-orbitron text-xl font-bold text-white">CHAMPIONSHIP</h3>
              </div>
              
              {topDrivers.length > 0 ? (
                <div className="space-y-3">
                  {topDrivers.map((driver, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-[var(--bg-carbon)] ${
                        index === 0 ? 'bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono font-bold text-lg ${
                        index === 0 ? 'bg-[var(--accent-cyan)] text-black' : 
                        'bg-[var(--bg-carbon)] text-[var(--text-silver)]'
                      }`}>
                        {driver.position}
                      </div>
                      <div className="flex-1">
                        <div className="font-orbitron font-bold text-white">
                          {driver.Driver.familyName.toUpperCase()}
                        </div>
                        <div className="font-mono text-xs text-[var(--text-muted)]">
                          {driver.Constructors?.[0]?.name || 'TBA'}
                        </div>
                      </div>
                      <div className="font-mono text-xl font-bold text-white">
                        {driver.points}
                        <span className="text-xs text-[var(--text-muted)] ml-1">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <span className="text-4xl mb-4">📈</span>
                  <span className="font-mono">Season not started</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === RIVALRY SECTION === */}
      {userStandings.length >= 1 && (
        <section className="py-8 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
             <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-2xl">🔥</span>
                <h2 className="font-orbitron text-3xl font-bold text-white text-center">FEATURED RIVALRY</h2>
                <span className="text-2xl">🔥</span>
             </div>
             <RivalryCard 
               player1={{
                 name: userStandings[0].username.split('@')[0],
                 driver: "Max Verstappen (Red Bull)",
                 points: userStandings[0].total_score,
               }}
               // Pass second player if exists, otherwise undefined to trigger "Vs The World" fallback
               player2={userStandings.length >= 2 ? {
                 name: userStandings[1].username.split('@')[0],
                 driver: "Lewis Hamilton (Ferrari)",
                 points: userStandings[1].total_score,
               } : undefined}
               races={1}
             />
          </div>
        </section>
      )}

      {/* === QUICK LINKS === */}
      <section className="py-12 px-4 md:px-8 border-t border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/calendar', icon: '📅', label: 'CALENDAR' },
            { href: '/results', icon: '🏆', label: 'STANDINGS' },
            { href: '/classification', icon: '📊', label: 'RESULTS' },
            { href: '/login', icon: '🔐', label: 'SIGN IN' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--glass-border)] 
                bg-[var(--bg-carbon)]/50 hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="font-orbitron text-sm font-bold text-[var(--text-silver)] group-hover:text-[var(--accent-cyan)]">
                {link.label}
              </span>
            </Link>
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