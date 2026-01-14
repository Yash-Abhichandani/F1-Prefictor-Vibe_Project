"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { config } from "../../lib/config";
import Link from "next/link";

export default function ResultsPage() {
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        // Fetch from our new Python endpoint that includes "Last 3 Races" logic
        const response = await fetch(`${config.apiUrl}/standings`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Enhance data to calculate "Latest GP Points"
            // We assume the first item in 'last_races' is the most recent one
            const enhancedData = data.map((user: any) => ({
                ...user,
                latest_points: user.last_races && user.last_races.length > 0 ? user.last_races[0].points : 0
            }));
            setStandings(enhancedData);
        } else {
            // Backend returned but no data yet
            setStandings([]);
        }
      } catch (err: any) {
        console.error("Error fetching standings:", err);
        setError(err.message || "Failed to connect to backend");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-orbitron animate-pulse text-2xl tracking-widest">CALCULATING CHAMPIONSHIP...</div>;

  // Error state - backend unreachable
  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-3xl font-black font-orbitron mb-4 text-center">Backend Offline</h2>
        <p className="text-gray-500 text-center max-w-md mb-6">
          Unable to fetch championship standings. The Python backend server may not be running.
        </p>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 max-w-md">
          <code className="text-red-400 text-sm">{error}</code>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition"
          >
            Retry
          </button>
          <Link 
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded font-bold transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // No standings yet
  if (standings.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <div className="text-6xl mb-6">🏁</div>
        <h2 className="text-3xl font-black font-orbitron mb-4 text-center">No Standings Yet</h2>
        <p className="text-gray-500 text-center max-w-md">
          The championship standings will appear once predictions are submitted and races are settled.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-red-500 selection:text-white">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-16 text-center border-b-4 border-red-600 pb-10 bg-gradient-to-b from-gray-900/50 to-transparent pt-10 rounded-t-3xl">
        <h1 className="text-5xl md:text-8xl font-black font-orbitron text-white tracking-tighter mb-4 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">
            WORLD <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">CHAMPIONSHIP</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-gray-700 w-20"></div>
            <p className="text-gray-400 text-xl tracking-[0.4em] font-light uppercase">
                Official Standings 2025
            </p>
            <div className="h-px bg-gray-700 w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* PODIUM (Top 3) */}
        {standings.length >= 3 && (
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-20 px-4">
                
                {/* 2nd Place */}
                <div className="flex-1 bg-[#121418] border-t-4 border-gray-400 rounded-xl p-8 text-center order-2 md:order-1 transform hover:-translate-y-2 transition duration-300 relative shadow-[0_10px_30px_rgba(156,163,175,0.2)]">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center border-4 border-[#0B0C10] font-black text-xl text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]">2</div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 mt-2">Runner Up</div>
                    <div className="text-2xl font-black font-orbitron text-white truncate">{standings[1].username.split('@')[0]}</div>
                    <div className="text-6xl font-mono font-black text-gray-300 mt-4 tracking-tighter">{standings[1].total_score}<span className="text-lg font-sans font-normal text-gray-600 ml-2">PTS</span></div>
                </div>

                {/* 1st Place (Bigger) */}
                <div className="flex-[1.2] bg-gradient-to-b from-[#1a0505] to-[#0a0a0a] border-t-4 border-red-600 rounded-xl p-12 text-center order-1 md:order-2 shadow-[0_0_60px_rgba(220,38,38,0.3)] z-10 transform scale-105 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center border-8 border-[#0B0C10] text-4xl shadow-[0_0_30px_rgba(234,179,8,0.6)]">👑</div>
                    <div className="text-red-500 text-sm font-bold uppercase tracking-[0.2em] mb-4 mt-4 animate-pulse">World Champion Leader</div>
                    <div className="text-4xl md:text-5xl font-black font-orbitron text-white truncate drop-shadow-md">{standings[0].username.split('@')[0]}</div>
                    <div className="text-8xl font-mono font-black text-yellow-400 mt-6 drop-shadow-lg tracking-tighter">{standings[0].total_score}<span className="text-xl font-sans font-normal text-yellow-600/70 ml-2">PTS</span></div>
                </div>

                {/* 3rd Place */}
                <div className="flex-1 bg-[#121418] border-t-4 border-orange-700 rounded-xl p-8 text-center order-3 md:order-3 transform hover:-translate-y-2 transition duration-300 relative shadow-[0_10px_30px_rgba(194,65,12,0.2)]">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center border-4 border-[#0B0C10] font-black text-xl text-white shadow-[0_0_15px_rgba(194,65,12,0.5)]">3</div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 mt-2">Third Place</div>
                    <div className="text-2xl font-black font-orbitron text-white truncate">{standings[2].username.split('@')[0]}</div>
                    <div className="text-6xl font-mono font-black text-orange-500 mt-4 tracking-tighter">{standings[2].total_score}<span className="text-lg font-sans font-normal text-gray-600 ml-2">PTS</span></div>
                </div>
            </div>
        )}

        {/* STANDINGS TABLE */}
        <div className="bg-[#121418] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black text-gray-500 text-xs uppercase tracking-[0.2em] font-bold font-orbitron h-16">
                        <th className="p-6 w-24 text-center border-b border-gray-800">Pos</th>
                        <th className="p-6 border-b border-gray-800">Driver (User)</th>
                        {/* New Columns */}
                        <th className="p-6 text-center border-b border-gray-800 hidden md:table-cell text-blue-400">Latest GP</th>
                        <th className="p-6 text-center border-b border-gray-800 hidden md:table-cell w-[350px]">Recent Form</th>
                        <th className="p-6 text-right border-b border-gray-800 text-red-600">Total Points</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {standings.map((user, index) => (
                        <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group h-28">
                            <td className="p-6 text-center font-mono text-3xl font-bold text-gray-700 group-hover:text-white transition italic">
                                {index + 1}
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-1.5 h-16 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-300 group-hover:h-20 ${index === 0 ? 'bg-yellow-500 text-yellow-500' : index === 1 ? 'bg-gray-300 text-gray-300' : index === 2 ? 'bg-orange-600 text-orange-600' : 'bg-gray-800 text-gray-800'}`}></div>
                                    <div>
                                        <span className="font-black text-3xl font-orbitron tracking-wide text-white block mb-1">{user.username.split('@')[0]}</span>
                                        {index === 0 && <span className="inline-block text-[10px] bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded border border-yellow-500/30 uppercase tracking-wider font-bold">Championship Leader</span>}
                                    </div>
                                </div>
                            </td>
                            
                            {/* LATEST RACE POINTS */}
                            <td className="p-6 text-center hidden md:table-cell">
                                <div className="inline-flex flex-col items-center justify-center bg-blue-900/10 border border-blue-500/30 p-3 rounded-lg min-w-[80px]">
                                    <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-1">Last Race</span>
                                    <span className="text-2xl font-mono font-black text-white">+{user.latest_points}</span>
                                </div>
                            </td>

                            {/* RECENT FORM COLUMN */}
                            <td className="p-6 hidden md:table-cell">
                                <div className="flex justify-center gap-4">
                                    {user.last_races && user.last_races.length > 0 ? (
                                        user.last_races.map((race: any, i: number) => (
                                            <div key={i} className="flex flex-col items-center bg-[#08090b] p-2 rounded-lg border border-gray-800 min-w-[70px] shadow-lg group-hover:border-gray-600 transition hover:-translate-y-1">
                                                <span className="text-xs font-bold text-gray-500 mb-1 tracking-widest">{race.code}</span>
                                                <span className={`text-xs font-mono font-black px-2 py-1 rounded border w-full text-center ${
                                                    race.points >= 20 ? 'bg-green-950/30 text-green-400 border-green-500/30' : 
                                                    race.points >= 10 ? 'bg-yellow-950/30 text-yellow-400 border-yellow-500/30' : 
                                                    'bg-gray-800 text-gray-500 border-gray-700'
                                                }`}>
                                                    +{race.points}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-gray-600 text-xs font-mono tracking-widest">NO DATA</span>
                                    )}
                                </div>
                            </td>

                            <td className="p-6 text-right">
                                <div className="flex flex-col items-end justify-center h-full pr-4">
                                    <span className="font-mono text-6xl font-black text-white group-hover:text-red-500 transition drop-shadow-lg tracking-tighter">{user.total_score}</span>
                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-[0.3em] group-hover:text-red-900/80">Total Points</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}