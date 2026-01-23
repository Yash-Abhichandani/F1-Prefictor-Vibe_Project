"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { liveApi, TimingDriver } from "@/app/services/live_api";
import { Loader2 } from "lucide-react";

export default function LiveTimingTower() {
  const [drivers, setDrivers] = useState<TimingDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchTiming = async () => {
      const data = await liveApi.getTiming();
      if (data) {
        setDrivers(data.drivers);
        setLoading(false);
      }
    };

    fetchTiming();

    // Poll every 4 seconds
    const interval = setInterval(fetchTiming, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl">
        <Loader2 className="animate-spin text-[var(--f1-red)]" size={24} />
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[var(--bg-carbon)]">
        <h3 className="text-sm font-mono text-[var(--accent-gold)] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--f1-red)] rounded-full animate-pulse" />
          Live Classification
        </h3>
      </div>

      {/* Driver List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
        <AnimatePresence mode="popLayout">
          {drivers.map((driver) => (
            <motion.div
              key={driver.driver_number}
              layoutId={`driver-${driver.driver_number}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-3 p-2 rounded hover:bg-white/5 group border border-transparent hover:border-white/10 transition-colors"
            >
              {/* Position */}
              <div className="w-6 text-center font-black font-orbitron text-white text-lg">
                {driver.position}
              </div>

              {/* Team Color Bar */}
              <div 
                className="w-1 h-8 rounded-full" 
                style={{ backgroundColor: driver.team_colour ? `#${driver.team_colour}` : "#666" }} 
              />

              {/* Driver Code */}
              <div className="flex-1">
                <div className="font-bold text-white font-mono leading-none">
                  {driver.driver_code}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  #{driver.driver_number}
                </div>
              </div>

              {/* Gap/Interval */}
              <div className="text-right font-mono text-sm">
                <div className="text-[var(--accent-cyan)] font-bold">
                  {driver.interval ? driver.interval : driver.gap_to_leader || "LEADER"}
                </div>
                {driver.sector_1 && (
                    <div className="flex justify-end gap-1 mt-1">
                        <SectorDot status={driver.sector_1?.status} />
                        <SectorDot status={driver.sector_2?.status} />
                        {/* Sector 3 usually not live in simple feeds, but placeholder */}
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SectorDot({ status }: { status?: 'purple' | 'green' | 'yellow' }) {
    if (!status) return <div className="w-1.5 h-1.5 rounded-full bg-white/10" />;
    
    const colors = {
        purple: "bg-[#D500F9]", // Fastest Overall
        green: "bg-[#00D2BE]",   // Personal Best
        yellow: "bg-[#FFEB3B]"   // Slower
    };

    return <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />;
}
