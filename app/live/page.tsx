"use client";

import { useEffect, useState } from "react";
import LiveTimingTower from "@/app/components/Live/LiveTimingTower";
import TelemetryGraph from "@/app/components/Live/TelemetryGraph";
import DriverRadar from "@/app/components/Analytics/DriverRadar";
import { liveApi, LiveSession } from "@/app/services/live_api";
import { Badge } from "lucide-react";

export default function LiveDashboard() {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [selectedDriver, setSelectedDriver] = useState(1); // Default to Verstappen (1)

  useEffect(() => {
    liveApi.getSession().then(setSession);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-12 px-6">
      
      {/* HEADER: Session Status */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-[var(--f1-red)] rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-[var(--f1-red)] uppercase tracking-widest">LIVE FEED</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white uppercase">
                {session?.circuit_short_name || "TRACK"} <span className="text-[var(--text-muted)]">//</span> {session?.session_name || "OFFLINE"}
            </h1>
        </div>
        <div className="hidden md:block text-right">
             <div className="text-sm font-mono text-[var(--text-muted)]">SYSTEM STATUS</div>
             <div className="text-[var(--accent-cyan)] font-bold">OPTIMAL</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Timing Tower */}
          <div className="lg:col-span-3">
              <LiveTimingTower />
          </div>

          {/* CENTER: Main Telemetry */}
          <div className="lg:col-span-6 space-y-6">
              {/* Telemetry Graph */}
              <TelemetryGraph driverNumber={selectedDriver} />
              
              {/* Driver Selector (Quick Mock) */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                  {[1, 44, 16, 63, 4, 81].map(num => (
                      <button 
                        key={num}
                        onClick={() => setSelectedDriver(num)}
                        className={`px-3 py-1 rounded font-mono text-xs border ${
                            selectedDriver === num 
                              ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]' 
                              : 'bg-transparent text-white border-white/20 hover:border-white'
                        }`}
                      >
                          #{num}
                      </button>
                  ))}
              </div>

              {/* Analytics Preview */}
              <div className="bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl p-4">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Badge size={16} /> PERFORMANCE ANALYSIS
                  </h3>
                  <DriverRadar driver="VER" year={2026} race="Monza" />
              </div>
          </div>

          {/* RIGHT: Weather / Race Control (Placeholder for now) */}
          <div className="lg:col-span-3 space-y-4">
              <div className="bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl p-4 h-[200px]">
                  <h3 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-4">TRACK CONDITIONS</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <div className="text-[var(--text-subtle)] text-[10px] uppercase">TRACK TEMP</div>
                          <div className="text-2xl font-bold text-white">42°C</div>
                      </div>
                      <div>
                          <div className="text-[var(--text-subtle)] text-[10px] uppercase">AIR TEMP</div>
                          <div className="text-2xl font-bold text-white">28°C</div>
                      </div>
                      <div>
                          <div className="text-[var(--text-subtle)] text-[10px] uppercase">HUMIDITY</div>
                          <div className="text-2xl font-bold text-[var(--accent-cyan)]">62%</div>
                      </div>
                      <div className="col-span-2 mt-4 pt-4 border-t border-white/5">
                          <div className="text-xs font-mono text-[var(--status-success)]">NO RAIN EXPECTED</div>
                      </div>
                  </div>
              </div>

               <div className="bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl p-4 h-[380px]">
                  <h3 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-4">RACE CONTROL</h3>
                  <div className="space-y-3 text-xs font-mono">
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-green-400">
                          [14:02] GREEN FLAG
                      </div>
                      <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400">
                          [14:00] YELLOW FLAG (SECTOR 2)
                      </div>
                  </div>
               </div>
          </div>

      </div>
    </div>
  );
}
