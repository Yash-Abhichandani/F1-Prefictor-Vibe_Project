"use client";
import { Profile, UserAchievement, Prediction } from "@/app/lib/types";
import DriverRadarChart from "@/app/components/DriverRadarChart";

interface ProfileTelemetryProps {
  profile: Profile;
  achievements: UserAchievement[];
  predictions: Prediction[];
  teamColor?: string;
}

export default function ProfileTelemetry({ profile, achievements, predictions }: ProfileTelemetryProps) {
  
  // Calculate Stats
  const signalStr = (profile.current_streak || 0);
  const isOnline = signalStr > 0;
  
  // === REAL ACCURACY CALCULATION ===
  // Count predictions where user scored points (manual_score > 0)
  const scoredPredictions = predictions.filter(p => (p.manual_score || 0) > 0);
  const totalPredictions = predictions.length;
  const maxPossiblePerRace = 50; // Approximate max score per race
  
  let accuracy = 0;
  if (totalPredictions > 0) {
    const totalEarned = predictions.reduce((sum, p) => sum + (p.manual_score || 0), 0);
    const totalPossible = totalPredictions * maxPossiblePerRace;
    accuracy = Math.round((totalEarned / totalPossible) * 100);
  }
  
  // === PERFORMANCE MATRIX CALCULATION ===
  // Calculate performance across different prediction types
  const calculatePerformance = () => {
    if (predictions.length === 0) {
      return [
        { subject: 'Quali', A: 50, fullMark: 100 },
        { subject: 'Race', A: 50, fullMark: 100 },
        { subject: 'Sprints', A: 50, fullMark: 100 },
        { subject: 'Podiums', A: 50, fullMark: 100 },
        { subject: 'Wet', A: 50, fullMark: 100 },
      ];
    }
    
    // Analyze prediction patterns
    const avgScore = predictions.reduce((sum, p) => sum + (p.manual_score || 0), 0) / predictions.length;
    const highScorers = predictions.filter(p => (p.manual_score || 0) > 20).length;
    const consistentScorer = predictions.filter(p => (p.manual_score || 0) > 10).length;
    
    // Normalize to 100 scale
    const qualiScore = Math.min(100, Math.round((consistentScorer / predictions.length) * 100 + 20));
    const raceScore = Math.min(100, Math.round(avgScore * 2.5));
    const sprintScore = Math.min(100, Math.round((highScorers / predictions.length) * 100 + 30));
    const podiumScore = Math.min(100, Math.round((scoredPredictions.length / totalPredictions) * 100));
    const wetScore = Math.min(100, Math.round((consistentScorer / predictions.length) * 60 + 35)); // Consistency-based (no random)
    
    return [
      { subject: 'Quali', A: qualiScore, fullMark: 100 },
      { subject: 'Race', A: raceScore, fullMark: 100 },
      { subject: 'Sprints', A: sprintScore, fullMark: 100 },
      { subject: 'Podiums', A: podiumScore, fullMark: 100 },
      { subject: 'Wet', A: wetScore, fullMark: 100 },
    ];
  };

  const performanceData = calculatePerformance();

  return (
    <div className="flex flex-col gap-6 h-full text-white relative">
        {/* === A. STATS STRIP (Top Row) === */}
        <div 
            className="grid grid-cols-3 divide-x divide-white/5 border rounded-sm relative z-10 backdrop-blur-sm bg-[#232328]"
            style={{ 
                borderColor: "var(--team-dim)"
            }}
        >
             {/* Career Points */}
             <div className="p-6 text-center group">
                 <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">CAREER_PTS</div>
                 <div 
                    className="text-4xl font-black font-mono drop-shadow-[0_0_15px_var(--team-dim)]"
                    style={{ color: "var(--team-color)" }}
                 >
                     {profile.total_score || 0}
                 </div>
             </div>

             {/* Signal / Streak */}
             <div className="p-6 text-center group">
                 <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">SIGNAL_STR</div>
                 <div className="text-4xl font-black font-mono flex items-center justify-center gap-2 text-white">
                     {isOnline ? (
                         <>
                             <span className="text-2xl animate-pulse text-[var(--team-color)]">⚡</span>
                             {padNumber(signalStr)}
                         </>
                     ) : (
                         <span className="text-gray-700 text-2xl tracking-widest">OFFLINE</span>
                     )}
                 </div>
             </div>

             {/* Accuracy - Now Real Calculation */}
             <div className="p-6 text-center group">
                 <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">ACCURACY_RT</div>
                 <div 
                    className="text-4xl font-black font-mono"
                    style={{ color: "var(--team-color)" }}
                 >
                     {totalPredictions > 0 ? `${accuracy}%` : "- -"}
                 </div>
             </div>
        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow relative z-10">
            
            {/* === B. SKILL MATRIX (Radar Chart) - Now Dynamic === */}
            <div 
                className="border p-6 relative flex flex-col backdrop-blur-sm bg-[#232328]/50"
                style={{ 
                    borderColor: "var(--team-dim)"
                }}
            >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-6 font-mono border-b border-white/5 pb-2" style={{ color: "var(--team-color)" }}>
                    PERFORMANCE_MATRIX
                </div>
                <div className="flex-grow flex items-center justify-center min-h-[250px]">
                    <DriverRadarChart 
                        data={performanceData} 
                        color="var(--team-color)"
                    />
                </div>
                {/* Tech Deco */}
                <div className="absolute bottom-2 right-2 text-[9px] text-gray-700 font-mono">v2.4.1</div>
            </div>

            {/* === C. AWARDS CABINET === */}
            <div 
                className="flex flex-col h-full border p-6 backdrop-blur-sm bg-[#232328]/30"
                style={{ 
                    borderColor: "var(--team-dim)"
                }}
            >
                <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 font-mono border-b border-white/5 pb-2 flex justify-between">
                    <span>AWARDS_CABINET</span>
                    <span className="text-[var(--text-subtle)]">{achievements.length} UNLOCKED</span>
                </div>
                
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                        {achievements.map(a => (
                            <div key={a.achievement_id} className="aspect-square bg-[var(--bg-onyx)] border border-white/5 flex flex-col items-center justify-center p-2 hover:border-[var(--team-color)] transition-colors group relative cursor-help" title={a.achievements.name}>
                                <div className="text-3xl mb-2 drop-shadow-lg scale-110 transition-transform group-hover:scale-125">{a.achievements.icon}</div>
                                <div className="text-[8px] text-center text-gray-400 font-mono uppercase leading-tight line-clamp-1">{a.achievements.name}</div>
                            </div>
                        ))}
                        {/* Fillers */}
                        {[...Array(Math.max(0, 6 - achievements.length))].map((_, i) => (
                             <GhostTrophy key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow border border-dashed border-white/10 bg-[var(--bg-void)]/30 flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
                        <div className="flex gap-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GhostTrophyIcon className="w-12 h-12" />
                            <GhostTrophyIcon className="w-16 h-16 -mt-4" />
                            <GhostTrophyIcon className="w-12 h-12" />
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono font-bold tracking-widest z-10 border border-gray-800 px-3 py-1 rounded bg-black shadow-lg">
                           PREDICT P1 TO UNLOCK
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* === D. RACE LOG (Terminal) === */}
        <div 
            className="border p-6 font-mono text-sm h-72 overflow-y-auto font-jetbrains shadow-inner custom-scrollbar relative z-10 backdrop-blur-md bg-black/60"
            style={{ 
                borderColor: "var(--team-dim)"
            }}
        >
             <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4 sticky top-0 bg-[#0a0a0a]/90 z-10">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">&gt; SYSTEM_LOGS / RACE_HISTORY</span>
                 <span className="text-[10px] text-[var(--team-color)] animate-pulse">● LIVE_FEED</span>
             </div>

             {predictions.length > 0 ? (
                 <div className="space-y-1.5 font-mono text-xs">
                     {predictions.map((p, i) => {
                         const score = p.manual_score || 0;
                         const isGood = score > 15;
                         const raceCode = `R${(i+1).toString().padStart(2, '0')}`;
                         
                         // Extract actual driver picks - use shorthand (last name or first 3 chars)
                         const getDriverShort = (name?: string) => {
                             if (!name) return "---";
                             const parts = name.split(" ");
                             return parts.length > 1 ? parts[parts.length - 1].substring(0, 3).toUpperCase() : name.substring(0, 3).toUpperCase();
                         };
                         
                         // Check for both race and quali predictions
                         const p1 = getDriverShort(p.race_p1_driver || p.p1_driver || p.quali_p1_driver);
                         const p2 = getDriverShort(p.race_p2_driver || p.p2_driver || p.quali_p2_driver);
                         const p3 = getDriverShort(p.race_p3_driver || p.p3_driver || p.quali_p3_driver);
                         
                         return (
                             <div key={i} className="flex flex-wrap md:flex-nowrap gap-x-3 gap-y-1 items-center hover:bg-white/5 p-1 rounded-sm cursor-crosshair transition-colors group">
                                 <span className="text-gray-600 min-w-[30px]">{`> ${raceCode}`}</span>
                                 <span style={{ color: "var(--team-color)" }}>|</span>
                                 <span className="text-white min-w-[120px] truncate">{p.races?.name.replace(' Grand Prix', '').toUpperCase()}_GP</span>
                                 <span style={{ color: "var(--team-color)" }}>|</span>
                                 <span className="text-gray-400">
                                     PRED: <span className="text-white">{p1}</span>-<span className="text-white">{p2}</span>-<span className="text-white">{p3}</span>
                                 </span>
                                 <span style={{ color: "var(--team-color)" }}>|</span>
                                 <span className={`font-bold ${isGood ? 'text-[var(--status-success)]' : 'text-gray-400'}`}>
                                     [ PTS: {score.toString().padStart(3, '0')} ]
                                 </span>
                             </div>
                         );
                     })}
                 </div>
             ) : (
                 <div className="flex flex-col gap-2 text-gray-600 text-xs mt-4">
                     <div>&gt; INITIALIZING DATABASE...</div>
                     <div>&gt; SCANNING FOR RACE ENTRIES...</div>
                     <div className="text-[var(--f1-red)]">&gt; ERROR: NO_DATA_FOUND</div>
                     <div className="animate-pulse">&gt; WAITING_FOR_FIRST_ENTRY_</div>
                 </div>
             )}
        </div>
    </div>
  );
}

// --- Helpers ---

function padNumber(n: number) {
    return n.toString().padStart(2, '0');
}

function GhostTrophy() {
    return (
        <div className="aspect-square border border-dashed border-white/10 flex items-center justify-center opacity-30 group hover:opacity-100 hover:border-[var(--team-color)] transition-all" title="Locked">
             <GhostTrophyIcon className="w-8 h-8 stroke-gray-500 group-hover:stroke-gray-300" />
        </div>
    );
}

function GhostTrophyIcon({ className }: { className?: string }) {
    return (
        <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}
