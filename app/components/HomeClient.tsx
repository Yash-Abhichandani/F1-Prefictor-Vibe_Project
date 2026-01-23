"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Trophy, Users, BarChart3, Swords, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import F1Button from "./ui/F1Button";
import GlitchText from "./ui/GlitchText";
import GlassCard from "./ui/GlassCard";
import Badge from "./ui/Badge";
import AdUnit from "./AdUnit";
import LaunchSequence from "./LaunchSequence";
import TelemetryLoader from "./TelemetryLoader";
import LiveSessionBanner from "./LiveSessionBanner";
import AmbientNumberBg from "./AmbientNumberBg";

// Typewriter Component
const TypewriterText = ({ text }: { text: string }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.015, delayChildren: 0.5 },
    },
  };

  const child = {
    visible: { opacity: 1, display: "inline-block" },
    hidden: { opacity: 0, display: "none" },
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-base md:text-2xl text-[var(--text-secondary)] max-w-xl leading-relaxed font-light inline-block w-full text-center lg:text-left"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
      <motion.span 
        initial={{ opacity: 0 }} 
        animate={{ opacity: [0, 1, 0] }} 
        transition={{ repeat: Infinity, duration: 0.8 }} 
        className="text-[var(--f1-red)] font-bold ml-0.5 inline-block"
      >
        _
      </motion.span>
    </motion.div>
  );
};

// Helper function to format race weekend dates (e.g., "14-16 MAR")
function getRaceWeekendDates(dateStr: string) {
  if (!dateStr) return "TBC";
  const date = new Date(dateStr);
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const startDay = Math.max(1, day - 2); // Assume Friday-Sunday
  return `${startDay}-${day} ${month}`;
}

interface UserStandings {
  rank: number;
  total: number;
  score: number;
}

interface HomeClientProps {
  userStandings: UserStandings | null; 
  nextRace: any;
  lastResults: any[];
}

export default function HomeClient({ userStandings, nextRace, lastResults }: HomeClientProps) {
  const [introFinished, setIntroFinished] = useState(false);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);

  // Nav Items Configuration
  const navItems = [
    { href: '/calendar', icon: <Calendar size={24} strokeWidth={1.5} />, label: 'CALENDAR', desc: 'Full 2026 Schedule' },
    { href: '/leaderboard', icon: <Trophy size={24} strokeWidth={1.5} />, label: 'LEADERBOARD', desc: 'Global Rankings' },
    { href: '/leagues', icon: <Users size={24} strokeWidth={1.5} />, label: 'LEAGUES', desc: 'Squad Battles' },
    { href: '/standings', icon: <BarChart3 size={24} strokeWidth={1.5} />, label: 'STANDINGS', desc: 'Driver & Constructor' },
    { href: '/rivalries', icon: <Swords size={24} strokeWidth={1.5} />, label: 'RIVALRIES', desc: 'Head-to-Head' },
    { href: '/guide', icon: <BookOpen size={24} strokeWidth={1.5} />, label: 'MANUAL', desc: 'System Protocols' },
    { href: '/profile', icon: <User size={24} strokeWidth={1.5} />, label: 'PROFILE', desc: 'Stats & History' },
  ];

  useEffect(() => {
    // Simulate Intro Delay
    const timer = setTimeout(() => setIntroFinished(true), 2500);
    
    // Fetch Top Drivers (Client Side)
    const fetchDrivers = async () => {
        try {
            const res = await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json");
            const data = await res.json();
            if (data.MRData.StandingsTable.StandingsLists.length > 0) {
              setTopDrivers(data.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5));
            }
        } catch (e) { console.error("Drivers Error", e); }
    };
    fetchDrivers();

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-[url('/grid-pattern.svg')] text-white overflow-hidden relative selection:bg-[var(--f1-red)] selection:text-white">
      
      {/* Ambient Number Background - Season Year */}
      <AmbientNumberBg number="26" color="#FF1801" opacity={15} />
      
      <LiveSessionBanner />
      
      {/* Intro Overlay */}
      <div className={`fixed inset-0 z-50 transition-transform duration-1000 ease-in-out ${introFinished ? '-translate-y-full' : 'translate-y-0'}`}>
         <TelemetryLoader onComplete={() => setIntroFinished(true)} />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative min-h-[90vh] flex flex-col justify-center pt-24 pb-12 overflow-hidden">
        {/* Background Elements - Boosted Opacity */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--f1-red)] opacity-[0.08] blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--accent-cyan)] opacity-[0.06] blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            {/* Left Content: Headline */}
            <div className="flex-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--f1-red)]/30 bg-[var(--f1-red)]/10 text-[var(--f1-red)] text-xs font-bold tracking-widest mb-6 animate-fade-in-up">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--f1-red)] animate-pulse"></span>
                  SEASON 2026 ACTIVE
               </div>
               
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.85] mb-8 font-orbitron">
                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 animate-fade-in-up">PREDICT</span>
                 <span className="block text-[var(--f1-red)] animate-fade-in-up [animation-delay:200ms] scale-105 origin-left">PERFORM</span>
                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-white to-white animate-fade-in-up [animation-delay:400ms]">PREVAIL</span>
               </h1>
               
               {/* Typewriter Effect Sub-header */}
               <div className="h-24 md:h-20 mb-8 md:mb-12 flex items-center justify-center lg:justify-start">
                   <TypewriterText text="The advanced telemetry hub for true F1 enthusiasts. Analyze data, outsmart the grid, and claim the championship." />
               </div>

               <div className="flex flex-wrap gap-5 justify-center lg:justify-start animate-fade-in-up [animation-delay:800ms]">
                 <F1Button href="/predict" variant="primary" size="lg" className="shadow-[0_0_30px_rgba(255,24,1,0.3)] hover:shadow-[0_0_50px_rgba(255,24,1,0.5)]">
                    ENTER PADDOCK [ &gt; ]
                 </F1Button>
                 <F1Button href="/leagues" variant="ghost" size="lg">
                    JOIN LEAGUE
                 </F1Button>
               </div>
            </div>
            
            {/* Right Content: Next Race Card */}
            {nextRace && (
                <div className="flex-1 w-full max-w-md animate-fade-in-up [animation-delay:1000ms]">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--f1-red)] to-[var(--accent-gold)] rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                        <GlassCard className="p-8 relative overflow-hidden flex flex-col items-center text-center border-t border-white/20">
                             <div className="absolute top-0 right-0 p-20 bg-[var(--f1-red)] opacity-[0.05] blur-3xl rounded-full"></div>
                             
                             <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[var(--accent-gold)] uppercase">Up Next on Grid</div>
                             <h2 className="text-3xl font-black italic text-white mb-6 font-orbitron">{nextRace.name.replace(' Grand Prix', '')}</h2>
                             
                             <div className="w-full space-y-6 mb-8">
                                <LaunchSequence targetTime={nextRace.race_time} label="SESSION STARTS IN:" showSeconds={true} />
                                
                                <div className="flex items-center justify-center gap-3 text-sm text-[var(--text-secondary)] bg-white/5 p-3 rounded-lg border border-white/5">
                                    <span className="text-[var(--f1-red)]">📍</span>
                                    <span className="font-medium tracking-wide">{nextRace.circuit}</span>
                                </div>
                             </div>
                             
                             <div className="w-full">
                                <Link href={`/predict/${nextRace.id}`} className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold tracking-[0.15em] transition-all uppercase group/btn">
                                   Enter Paddock <span className="ml-1 group-hover/btn:translate-x-1 inline-block transition-transform">→</span>
                                </Link>
                             </div>
                        </GlassCard>
                    </div>
                </div>
            )}
          </div>
        </div>
      </section>
      
      {/* === AD PLACEMENT === */}
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <AdUnit label="Advertisement" slot="header-slot" />
      </div>

      {/* === COMMAND CENTER (SYSTEM MODULES) === */}
      <section className="py-24 border-b border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                 <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white font-orbitron mb-4">
                        COMMAND CENTER
                    </h2>
                    <div className="h-1 w-24 bg-[var(--f1-red)] shadow-[0_0_15px_var(--f1-red)] rounded-full text-left" />
                 </div>
                 
                 {/* Current Ranking Widget - Now Dynamic */}
                 <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5 backdrop-blur-sm">
                    <div className="text-right">
                       <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Your Ranking</div>
                       <div className="text-white font-bold text-sm tracking-wide">
                         {userStandings ? `OF ${userStandings.total}` : "GLOBAL LEAGUE"}
                       </div>
                    </div>
                    <div className="text-4xl font-bold text-[var(--accent-gold)] font-mono">
                      {userStandings ? `#${userStandings.rank}` : "--"}
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in-up [animation-delay:200ms]">
                 {navItems.map((item, i) => (
                     <Link key={item.href} href={item.href} className="group h-full">
                         <div className="h-full bg-[var(--bg-carbon)]/30 border border-white/10 hover:border-[var(--f1-red)] hover:shadow-[0_0_15px_rgba(255,24,1,0.2)] transition-all duration-200 p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden group-hover:bg-[var(--bg-carbon)]/60 rounded-sm">
                            <div className="absolute top-1 right-1 text-[8px] font-mono text-white/20 group-hover:text-[var(--f1-red)]">SYS_{i+1}</div>
                            <div className={`text-white/60 group-hover:text-white transition-colors duration-200`}>
                                {item.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold font-mono tracking-widest text-white/80 group-hover:text-white uppercase mb-1">{item.label}</div>
                            </div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[size:4px_4px] pointer-events-none" />
                         </div>
                     </Link>
                 ))}
             </div>
          </div>
      </section>

      {/* === LIVE TELEMETRY SECTION === */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/20 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Podium Module */}
                  <Link href="/classification" className="group block">
                      <div className="bg-[var(--bg-carbon)] rounded-3xl border border-white/5 p-8 relative overflow-hidden h-full transition-all duration-300 group-hover:border-[var(--accent-gold)]/50 group-hover:shadow-[0_0_30px_rgba(201,169,98,0.1)]">
                          <div className="absolute top-0 right-0 p-32 bg-[var(--accent-gold)] opacity-[0.03] blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-[0.08]"></div>
                          
                          <div className="flex items-center justify-between mb-8">
                              <div>
                                  <h3 className="text-xl font-bold text-white font-orbitron mb-1 group-hover:text-[var(--accent-gold)] transition-colors">RECENT RESULTS</h3>
                                  <div className="text-[10px] text-[var(--accent-gold)] tracking-widest uppercase font-bold">Latest Podium</div>
                              </div>
                              <Badge variant="outline" className="group-hover:bg-[var(--accent-gold)] group-hover:text-black transition-colors">LAST RACE</Badge>
                          </div>

                          {lastResults.length > 0 ? (
                              <div className="space-y-4 relative z-10">
                                  {lastResults.map((result, i) => (
                                      <div key={i} className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all">
                                          <div className={`text-2xl font-black font-mono w-8 ${i===0 ? 'text-[var(--accent-gold)] drop-shadow-[0_0_8px_rgba(201,169,98,0.5)]' : 'text-white/30'}`}>0{i+1}</div>
                                          <div className="flex-1">
                                              <div className="font-bold text-white text-lg tracking-wide transition-colors">{result.Driver.familyName.toUpperCase()}</div>
                                              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{result.Constructor.name}</div>
                                          </div>
                                          <div className="text-right">
                                              <div className="text-xl font-bold text-white font-mono gap-1 flex items-center justify-end">
                                                 <span className="text-[var(--accent-cyan)] text-sm">+</span>
                                                 {result.points}
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center py-12">
                                  <LoadingSpinner variant="minimal" message="FETCHING_PODIUM_DATA" />
                              </div>
                          )}
                      </div>
                  </Link>

                  {/* Driver Standings Module */}
                  <Link href="/standings" className="group block">
                      <div className="bg-[var(--bg-carbon)] rounded-3xl border border-white/5 p-8 relative overflow-hidden h-full transition-all duration-300 group-hover:border-[var(--f1-red)]/50 group-hover:shadow-[0_0_30px_rgba(255,24,1,0.1)]">
                          <div className="absolute bottom-0 left-0 p-32 bg-[var(--f1-red)] opacity-[0.03] blur-3xl rounded-full transition-opacity duration-500 group-hover:opacity-[0.08]"></div>
                          
                          <div className="flex items-center justify-between mb-8">
                              <div>
                                  <h3 className="text-xl font-bold text-white font-orbitron mb-1 group-hover:text-[var(--f1-red)] transition-colors">DRIVER STANDINGS</h3>
                                  <div className="text-[10px] text-[var(--f1-red)] tracking-widest uppercase font-bold">Top 5 Contenders</div>
                              </div>
                              <Badge variant="outline" className="group-hover:bg-[var(--f1-red)] group-hover:text-white transition-colors">LIVE</Badge>
                          </div>

                          <div className="space-y-3 relative z-10">
                              {topDrivers.length > 0 ? topDrivers.map((d, i) => (
                                  <div key={d.Driver.driverId} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <span className="font-mono text-white/40 w-4 text-sm">{i+1}</span>
                                          <div>
                                              <div className="font-bold text-white text-sm">{d.Driver.givenName} {d.Driver.familyName.toUpperCase()}</div>
                                              <div className="text-[10px] text-[var(--text-muted)] uppercase">{d.Constructors[0].name}</div>
                                          </div>
                                      </div>
                                      <div className="font-mono font-bold text-[var(--accent-cyan)]">{d.points} PTS</div>
                                  </div>
                              )) : (
                                  <div className="text-center py-12">
                                     <LoadingSpinner variant="minimal" message="SYNCING_GRID_DATA" />
                                  </div>
                              )}
                          </div>
                      </div>
                  </Link>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10 text-center px-6">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 font-orbitron tracking-tighter">
                  LIGHTS OUT AND<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">AWAY WE GO.</span>
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-12 max-w-xl mx-auto font-light leading-relaxed">
                 Join the most immersive F1 prediction league on the web. It's free, it's fast, and the paddock is waiting for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <F1Button href="/login" variant="primary" size="xl" className="shadow-[0_0_60px_rgba(225,6,0,0.4)] hover:shadow-[0_0_90px_rgba(225,6,0,0.6)] px-12 py-5 text-lg">
                    CREATE FREE ACCOUNT
                 </F1Button>
              </div>
          </div>
      </section>

    </div>
  );
}
