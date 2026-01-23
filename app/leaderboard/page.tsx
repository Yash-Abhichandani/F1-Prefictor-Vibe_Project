"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { config } from "../../lib/config";
import LoadingSpinner from "../components/LoadingSpinner";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import F1Button from "../components/ui/F1Button";
import AdUnit from "../components/AdUnit";
import { TEAMS_2026, TEAM_COLORS } from "../lib/drivers";

// Deterministic Team Color Assignment
const getTeamColor = (username: string) => {
  if (!username) return TEAM_COLORS["Red Bull"];
  const teams = Object.keys(TEAM_COLORS);
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % teams.length;
  return TEAM_COLORS[teams[index]];
};

interface UserStanding {
  id: string;
  username: string;
  total_score: number;
  is_admin: boolean;
  latest_points?: number;
  last_races?: { code: string; points: number }[];
  rank_change?: number; // Simulator for now
}

// Simple Sparkline Component
const Sparkline = ({ data }: { data: number[] }) => {
  if (!data?.length) return <div className="w-12 h-6 bg-[var(--bg-onyx)]/50 rounded" />;
  const width = 60;
  const height = 24;
  const max = 26; // max points + buffer
  const step = width / (data.length - 1 || 1);
  
  const points = data.map((d, i) => `${i * step},${height - (d / max) * height}`).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline 
        points={points} 
        fill="none" 
        stroke="var(--accent-cyan)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
      {data.map((d, i) => (
        <circle 
          key={i} 
          cx={i * step} 
          cy={height - (d / max) * height} 
          r="1.5" 
          fill={d >= 25 ? "var(--telemetry-purple)" : d >= 15 ? "var(--status-success)" : "var(--accent-cyan)"} 
        />
      ))}
    </svg>
  );
};

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<UserStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchUser = async () => {
             try {
               const { data: { user }, error } = await supabase.auth.getUser();
               if (error || !user) return null;
               return user.id;
             } catch {
               return null;
             }
        };

        const fetchStandings = async () => {
             const response = await fetch(`${config.apiUrl}/standings`);
             if (response.ok) {
               return await response.json();
             }
             return [];
        };

        const [userId, standingsData] = await Promise.all([fetchUser(), fetchStandings()]);
        
        if (userId) setCurrentUserId(userId);
        if (standingsData) setStandings(standingsData);

      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentUserRank = standings.findIndex(s => s.id === currentUserId) + 1;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Header - Telemetry Style */}
        <div className="flex items-end justify-between mb-8 border-b border-[var(--glass-border)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-[var(--f1-red)] animate-pulse rounded-full" />
              <span className="text-xs font-mono text-[var(--f1-red)] tracking-widest uppercase">Live Timing</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight uppercase italic">
              Founders League
            </h1>
          </div>
          <div className="text-right hidden md:block">
             <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Season Status</div>
             <div className="text-xl font-mono text-[var(--accent-cyan)]">RACE 01/24</div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
             <div className="py-20">
                <LoadingSpinner message="Fetching Telemetry..." />
             </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Top 3 - "Podium Data" */}
            {standings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* P2 */}
                    {standings[1] && (
                        <div className="order-2 md:order-1 bg-[var(--bg-card)] border border-[var(--glass-border)] p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                <span className="text-4xl font-black text-[var(--text-muted)] opacity-20">02</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded bg-gray-400 flex items-center justify-center font-bold text-black font-mono">2</div>
                                <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Silver</span>
                            </div>
                            <div className="font-bold text-xl text-white truncate mb-1">{standings[1].username?.split('@')[0]}</div>
                            <div className="font-mono text-2xl text-[var(--accent-cyan)]">{standings[1].total_score} <span className="text-xs text-[var(--text-muted)]">PTS</span></div>
                        </div>
                    )}
                    
                    {/* P1 */}
                    {standings[0] && (
                        <div className="order-1 md:order-2 bg-[var(--accent-gold-dim)] border border-[var(--accent-gold)] p-6 relative overflow-hidden transform md:-translate-y-2 shadow-[var(--shadow-glow-gold)] group">
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                            
                            <div className="absolute top-0 right-0 p-2">
                                <span className="text-5xl font-black text-[var(--accent-gold)] opacity-20">01</span>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded bg-[var(--accent-gold)] flex items-center justify-center font-bold text-black font-mono text-xl">1</div>
                                <span className="text-sm text-[var(--accent-gold)] uppercase tracking-wider font-bold animate-pulse">Leader</span>
                            </div>
                            <div className="font-black text-2xl text-white truncate mb-1">{standings[0].username?.split('@')[0]}</div>
                            <div className="font-mono text-4xl text-[var(--accent-gold)]">{standings[0].total_score} <span className="text-sm text-[var(--accent-gold)]/70">PTS</span></div>
                        </div>
                    )}

                    {/* P3 */}
                    {standings[2] && (
                        <div className="order-3 bg-[var(--bg-card)] border border-[var(--glass-border)] p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                <span className="text-4xl font-black text-[var(--text-muted)] opacity-20">03</span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded bg-orange-700 flex items-center justify-center font-bold text-white font-mono">3</div>
                                <span className="text-sm text-orange-700 uppercase tracking-wider font-bold">Bronze</span>
                            </div>
                            <div className="font-bold text-xl text-white truncate mb-1">{standings[2].username?.split('@')[0]}</div>
                            <div className="font-mono text-2xl text-[var(--accent-cyan)]">{standings[2].total_score} <span className="text-xs text-[var(--text-muted)]">PTS</span></div>
                        </div>
                    )}
                </div>
            )}

            {/* TIMING TOWER LIST */}
            <div className="bg-[var(--bg-midnight)] border border-[var(--glass-border)] rounded-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[var(--bg-carbon)] border-b border-[var(--glass-border)] text-[9px] md:text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                    <div className="col-span-1 text-center">Pos</div>
                    <div className="col-span-1 text-center hidden md:block">Var</div>
                    <div className="col-span-5 md:col-span-4">Driver</div>
                    <div className="col-span-3 md:col-span-4 text-center">Telemetry</div>
                    <div className="col-span-3 md:col-span-2 text-right">Points</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[var(--glass-border)]">
                    {standings.map((user, index) => {
                        const position = index + 1;
                        const isCurrentUser = user.id === currentUserId;
                        const pointsData = user.last_races?.map(r => r.points) || [0, 0, 0, 0, 0];
                        
                        const teamColor = getTeamColor(user.username || 'User');
                        
                        return (
                            <Link 
                                href={`/profile/${user.id}`}
                                key={user.id}
                                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[var(--bg-onyx)] transition-all duration-200 group relative overflow-hidden ${
                                    isCurrentUser ? 'bg-[var(--accent-cyan-dim)]' : ''
                                }`}
                            >
                                {/* Team Color Stripe */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-70" style={{ backgroundColor: teamColor }} />
                                {/* Position */}
                                <div className="col-span-1 flex justify-center">
                                    <span className={`font-mono font-bold text-lg ${position <= 3 ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`}>
                                        {position}
                                    </span>
                                </div>

                                {/* Variation - Now dynamic */}
                                <div className="col-span-1 hidden md:flex justify-center items-center">
                                    {user.rank_change !== undefined && user.rank_change !== 0 ? (
                                      <span className={`text-[10px] ${user.rank_change > 0 ? 'text-[var(--status-success)]' : 'text-[var(--f1-red)]'}`}>
                                        {user.rank_change > 0 ? '▲' : '▼'}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-[var(--text-muted)]">–</span>
                                    )}
                                </div>

                                {/* Driver Name & Tag */}
                                <div className="col-span-5 md:col-span-4 flex items-center gap-3 overflow-hidden">
                                    <div className="truncate font-bold text-sm md:text-base text-white group-hover:text-[var(--accent-cyan)] transition-colors">
                                        {user.username?.split('@')[0] || 'Unknown'}
                                        {isCurrentUser && <span className="ml-2 text-[9px] bg-[var(--accent-cyan)] text-black px-1 rounded font-bold uppercase">ME</span>}
                                    </div>
                                    {user.is_admin && <span className="text-[10px] text-[var(--accent-gold)] border border-[var(--accent-gold)] px-1 rounded hidden lg:inline">TM</span>}
                                </div>

                                {/* Telemetry Sparkline */}
                                <div className="col-span-3 md:col-span-4 flex justify-center items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Sparkline data={pointsData} />
                                </div>

                                {/* Total Points */}
                                <div className="col-span-3 md:col-span-2 text-right">
                                    <div className="font-mono font-bold text-lg text-white">
                                        {user.total_score}
                                    </div>
                                    <div className="text-[9px] text-[var(--telemetry-purple)] font-mono hidden sm:block">
                                        GAP: {index === 0 ? '-' : `-${(standings[0]?.total_score || 0) - user.total_score}`}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Pagination / CTA */}
            <div className="text-center pt-8 border-t border-[var(--glass-border)] mt-4">
                <p className="text-[var(--text-muted)] text-sm mb-4 font-mono">DATA STREAM LIVE</p>
                <F1Button href="/calendar" variant="secondary" className="text-xs uppercase tracking-widest">
                    Submit New Prediction
                </F1Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
