"use client";
import { useEffect, useState } from "react";

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [teamStandings, setTeamStandings] = useState<any[]>([]);
  const [view, setView] = useState<"drivers" | "teams">("drivers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Drivers
        const resDrivers = await fetch("https://api.jolpi.ca/ergast/f1/current/driverStandings.json");
        const dataDrivers = await resDrivers.json();
        const driversList = dataDrivers?.MRData?.StandingsTable?.StandingsLists;
        if (driversList && driversList.length > 0 && driversList[0].DriverStandings) {
          setDriverStandings(driversList[0].DriverStandings);
        }

        // Fetch Constructors
        const resTeams = await fetch("https://api.jolpi.ca/ergast/f1/current/constructorStandings.json");
        const dataTeams = await resTeams.json();
        const teamsList = dataTeams?.MRData?.StandingsTable?.StandingsLists;
        if (teamsList && teamsList.length > 0 && teamsList[0].ConstructorStandings) {
          setTeamStandings(teamsList[0].ConstructorStandings);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-orbitron animate-pulse text-xl tracking-widest">FETCHING FIA TELEMETRY...</div>;

  // Show message if no data available (e.g., before season starts)
  if (driverStandings.length === 0 && teamStandings.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-orbitron">
        <h2 className="text-2xl mb-4">Standings Not Available</h2>
        <p className="text-gray-500 text-center max-w-md">
          The 2026 F1 season has not started yet. Standings will appear once the first race is completed!
        </p>
      </div>
    );
  }

  const currentData = view === "drivers" ? driverStandings : teamStandings;
  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-red-500 selection:text-white">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-16 text-center border-b-4 border-blue-600 pb-10 bg-gradient-to-b from-gray-900/50 to-transparent pt-10 rounded-t-3xl">
        <h1 className="text-5xl md:text-8xl font-black font-orbitron text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            {view === "drivers" ? "DRIVER" : "TEAM"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-800">STANDINGS</span>
        </h1>
        
        {/* TOGGLE SWITCH */}
        <div className="flex justify-center mt-8">
            <div className="bg-gray-900 p-1 rounded-full flex border border-gray-700 shadow-lg">
                <button 
                    onClick={() => setView("drivers")}
                    className={`px-8 py-3 rounded-full font-black uppercase text-sm transition-all duration-300 font-orbitron tracking-wider ${view === "drivers" ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]" : "text-gray-500 hover:text-white"}`}
                >
                    Drivers
                </button>
                <button 
                    onClick={() => setView("teams")}
                    className={`px-8 py-3 rounded-full font-black uppercase text-sm transition-all duration-300 font-orbitron tracking-wider ${view === "teams" ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]" : "text-gray-500 hover:text-white"}`}
                >
                    Constructors
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* TOP 3 PODIUM DISPLAY */}
        <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-20 px-4">
            {/* 2nd Place */}
            {top3[1] && (
                <div className="flex-1 bg-[#121418] border-t-4 border-gray-400 rounded-xl p-8 text-center order-2 md:order-1 transform hover:-translate-y-2 transition duration-300 relative shadow-2xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center border-4 border-[#0B0C10] font-black text-xl text-black">2</div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 mt-2">P2</div>
                    <div className="text-3xl font-black font-orbitron text-white truncate">
                        {view === "drivers" ? top3[1].Driver.familyName.toUpperCase() : top3[1].Constructor.name.toUpperCase()}
                    </div>
                    {view === "drivers" && <div className="text-gray-500 text-sm font-bold uppercase mt-1">{top3[1].Constructors[0].name}</div>}
                    <div className="text-6xl font-mono font-black text-gray-300 mt-4 tracking-tighter">{top3[1].points}</div>
                </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
                <div className="flex-[1.2] bg-gradient-to-b from-[#0a101f] to-[#0a0a0a] border-t-4 border-blue-600 rounded-xl p-12 text-center order-1 md:order-2 shadow-[0_0_60px_rgba(37,99,235,0.2)] z-10 transform scale-105 relative">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center border-8 border-[#0B0C10] text-4xl shadow-[0_0_30px_rgba(234,179,8,0.6)]">🏆</div>
                    <div className="text-blue-500 text-sm font-bold uppercase tracking-[0.2em] mb-4 mt-4 animate-pulse">Current Leader</div>
                    <div className="text-4xl md:text-5xl font-black font-orbitron text-white truncate drop-shadow-md">
                        {view === "drivers" ? top3[0].Driver.familyName.toUpperCase() : top3[0].Constructor.name.toUpperCase()}
                    </div>
                    {view === "drivers" && <div className="text-gray-400 text-sm font-bold uppercase mt-2">{top3[0].Constructors[0].name}</div>}
                    <div className="text-8xl font-mono font-black text-yellow-400 mt-6 drop-shadow-lg tracking-tighter">{top3[0].points}</div>
                </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
                <div className="flex-1 bg-[#121418] border-t-4 border-orange-700 rounded-xl p-8 text-center order-3 md:order-3 transform hover:-translate-y-2 transition duration-300 relative shadow-2xl">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center border-4 border-[#0B0C10] font-black text-xl text-white">3</div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 mt-2">P3</div>
                    <div className="text-3xl font-black font-orbitron text-white truncate">
                        {view === "drivers" ? top3[2].Driver.familyName.toUpperCase() : top3[2].Constructor.name.toUpperCase()}
                    </div>
                    {view === "drivers" && <div className="text-gray-500 text-sm font-bold uppercase mt-1">{top3[2].Constructors[0].name}</div>}
                    <div className="text-6xl font-mono font-black text-orange-500 mt-4 tracking-tighter">{top3[2].points}</div>
                </div>
            )}
        </div>

        {/* FULL LIST */}
        <div className="bg-[#121418] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black text-gray-500 text-xs uppercase tracking-[0.2em] font-bold font-orbitron h-16">
                        <th className="p-6 w-24 text-center border-b border-gray-800">Pos</th>
                        <th className="p-6 border-b border-gray-800">{view === "drivers" ? "Driver" : "Team"}</th>
                        {view === "drivers" && <th className="p-6 hidden md:table-cell border-b border-gray-800">Constructor</th>}
                        <th className="p-6 text-center border-b border-gray-800">Wins</th>
                        <th className="p-6 text-right border-b border-gray-800 text-blue-500">Points</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                    {rest.map((item: any) => (
                        <tr key={item.position} className="hover:bg-white/[0.03] transition-colors group h-20">
                            <td className="p-6 text-center font-mono text-2xl font-bold text-gray-600 group-hover:text-white transition italic">
                                {item.position}
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-8 bg-gray-700 group-hover:bg-white transition-colors"></div>
                                    <div>
                                        <span className="font-black text-xl font-orbitron tracking-wide text-white block">
                                            {view === "drivers" ? item.Driver.familyName.toUpperCase() : item.Constructor.name.toUpperCase()}
                                        </span>
                                        {view === "drivers" && (
                                            <span className="text-xs text-gray-500 uppercase tracking-widest">{item.Driver.givenName}</span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            {view === "drivers" && (
                                <td className="p-6 hidden md:table-cell text-gray-400 font-bold uppercase tracking-wider text-sm">
                                    {item.Constructors[0].name}
                                </td>
                            )}
                            <td className="p-6 text-center font-mono text-gray-500 group-hover:text-white">
                                {item.wins}
                            </td>
                            <td className="p-6 text-right">
                                <span className="font-mono text-3xl font-black text-white group-hover:text-blue-500 transition drop-shadow-lg tracking-tighter">
                                    {item.points}
                                </span>
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