"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";

export default function ClassificationPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from Jolpica (Open Source F1 Data)
    fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
      .then((res) => res.json())
      .then((data) => {
        const races = data?.MRData?.RaceTable?.Races;
        if (races && races.length > 0) {
          setResults(races[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
     <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--f1-red)]/30 border-t-[var(--f1-red)] rounded-full animate-spin" />
            <span className="text-[var(--accent-cyan)] font-mono text-sm tracking-widest animate-pulse">FETCHING TELEMETRY...</span>
        </div>
     </div>
  );

  if (!results) return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center pt-24">
      <div className="text-6xl mb-4 grayscale opacity-20">🏁</div>
      <h2 className="text-2xl font-bold text-white font-orbitron mb-2">NO RACE DATA</h2>
      <p className="text-[var(--text-secondary)]">The 2026 season data is currently offline.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-32 pb-20 px-6 relative overflow-hidden">
        
       {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--f1-red)] opacity-[0.03] blur-[150px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Badge variant="red">OFFICIAL CLASSIFICATION</Badge>
                    <span className="text-[var(--text-muted)] text-xs tracking-widest uppercase font-bold">session_id: {results.Circuit.circuitId}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-orbitron text-white uppercase tracking-tighter mb-2">
                    {results.raceName}
                </h1>
                <p className="text-[var(--text-secondary)] text-lg font-mono tracking-wide uppercase flex items-center gap-2">
                    <span className="text-[var(--accent-gold)]">Round {results.round}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"/>
                    <span>{results.season}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"/>
                    <span>{results.date}</span>
                </p>
            </div>
            
            <Link href="/" className="group flex items-center gap-2 text-[var(--text-subtle)] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Paddock
            </Link>
        </div>

        {/* RESULTS TABLE */}
        <GlassCard className="overflow-hidden p-0 border-white/10" variant="default">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] text-[var(--accent-cyan)] uppercase tracking-[0.2em] font-bold">
                            <th className="p-6 w-24 text-center">Pos</th>
                            <th className="p-6">Driver / Team</th>
                            <th className="p-6 w-32 text-center">Grid</th>
                            <th className="p-6 text-right">Time / Gap</th>
                            <th className="p-6 text-right text-white w-32">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {results.Results.map((result: any, i: number) => (
                            <tr key={result.position} className="hover:bg-white/[0.03] transition-colors group">
                                <td className="p-5 text-center">
                                    <span className={`font-mono text-xl font-bold ${
                                        i === 0 ? 'text-[var(--accent-gold)]' : 
                                        i === 1 ? 'text-gray-300' : 
                                        i === 2 ? 'text-orange-700' : 
                                        'text-white/30'
                                    }`}>
                                        {result.position}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1 h-8 rounded-full bg-white/10 group-hover:bg-[var(--f1-red)] transition-colors" />
                                        <div>
                                            <div className="font-bold text-lg text-white font-heading tracking-wide flex items-center gap-2">
                                                {result.Driver.givenName} <span className="uppercase">{result.Driver.familyName}</span>
                                                <span className="text-[10px] font-mono bg-white/10 text-[var(--text-secondary)] px-1.5 py-0.5 rounded ml-2 group-hover:bg-[var(--f1-red)] group-hover:text-white transition-colors">{result.number}</span>
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mt-1">
                                                {result.Constructor.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                     <span className={`text-xs font-mono font-bold ${parseInt(result.grid) < parseInt(result.position) ? 'text-[var(--f1-red)]' : parseInt(result.grid) > parseInt(result.position) ? 'text-[var(--status-success)]' : 'text-[var(--text-muted)]'}`}>
                                        {result.grid === "0" ? "PL" : `P${result.grid}`}
                                        {result.grid !== "0" && parseInt(result.grid) !== parseInt(result.position) && (
                                            <span className="ml-1 opacity-60">
                                                {parseInt(result.grid) > parseInt(result.position) ? '▲' : '▼'}
                                                {Math.abs(parseInt(result.grid) - parseInt(result.position))}
                                            </span>
                                        )}
                                     </span>
                                </td>
                                <td className="p-5 text-right font-mono text-[var(--text-secondary)]">
                                    {result.Time ? (
                                        <span className={i===0 ? 'text-[var(--accent-gold)] font-bold' : ''}>{result.Time.time}</span>
                                    ) : (
                                        <span className="text-[var(--f1-red)]">{result.status}</span>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="font-mono text-xl font-bold text-white group-hover:text-[var(--accent-cyan)] transition-colors">
                                        +{result.points}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>

      </div>
    </div>
  );
}