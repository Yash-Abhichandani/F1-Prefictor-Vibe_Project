"use client";

import DriverRadar from "@/app/components/Analytics/DriverRadar";
import GlassCard from "@/app/components/ui/GlassCard";
import { Badge, BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-12 px-6">
       
       <div className="max-w-7xl mx-auto mb-12">
           <h1 className="text-4xl md:text-6xl font-black font-orbitron text-white uppercase tracking-tighter mb-4">
               Deep <span className="text-[var(--accent-gold)]">Telemetry</span>
           </h1>
           <p className="text-[var(--text-secondary)] font-mono max-w-2xl">
               Historical performance analysis powered by FastF1. Compare braking points, throttle gradients, and tyre degradation models.
           </p>
       </div>

       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Radar Chart Section */}
           <GlassCard className="p-8">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <Badge className="text-[var(--f1-red)]" /> Driver DNA
                   </h3>
                   <div className="text-xs font-mono text-[var(--text-muted)] border border-white/10 px-2 py-1 rounded">
                       2026 / MONZA / RACE
                   </div>
               </div>
               <div className="h-[400px]">
                   <DriverRadar driver="VER" year={2026} race="Monza" />
               </div>
               <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                   <div className="p-2 bg-white/5 rounded">
                       <div className="text-[var(--text-subtle)] text-[10px] uppercase">BRAKING</div>
                       <div className="text-white font-bold">96/100</div>
                   </div>
                   <div className="p-2 bg-white/5 rounded">
                       <div className="text-[var(--text-subtle)] text-[10px] uppercase">CORNERING</div>
                       <div className="text-white font-bold">92/100</div>
                   </div>
                   <div className="p-2 bg-white/5 rounded">
                       <div className="text-[var(--text-subtle)] text-[10px] uppercase">TYRES</div>
                       <div className="text-white font-bold">88/100</div>
                   </div>
               </div>
           </GlassCard>

           {/* Stint Analysis (Placeholder for now) */}
           <GlassCard className="p-8 opacity-75">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                       <TrendingUp className="text-[var(--accent-cyan)]" /> Stint Strategy
                   </h3>
                   <div className="text-xs font-mono text-[var(--text-muted)]">COMING SOON</div>
               </div>
               <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                    <div className="text-center">
                        <BarChart3 size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)] font-mono">
                            TYRE DEGRADATION MODELS<br/>INITIATING...
                        </p>
                    </div>
               </div>
           </GlassCard>

       </div>
    </div>
  );
}
