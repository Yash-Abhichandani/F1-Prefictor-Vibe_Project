"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GlassCard from "../components/ui/GlassCard";
import F1Button from "../components/ui/F1Button";
import { Calendar, Trophy, Users, Crosshair, TrendingUp } from "lucide-react";

// Animation Variants
const fadeIn: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const
    }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-24 pb-16 overflow-x-hidden text-white relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--f1-red)]/5 rounded-full blur-[120px] animate-pulse-slow" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[var(--accent-cyan)]/5 rounded-full blur-[150px] opacity-40" />
         <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-overlay" />
         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* === HERO SECTION === */}
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="mb-24 md:mb-32 flex flex-col items-center text-center"
        >
            <motion.div variants={fadeIn} custom={0} className="inline-block mb-6">
                <span className="px-4 py-2 bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-full text-[var(--accent-gold)] text-[10px] font-mono tracking-[0.3em] uppercase backdrop-blur-md shadow-[0_0_20px_-5px_var(--accent-gold)]">
                    System Protocol v3.0
                </span>
            </motion.div>
            
            <motion.h1 
                variants={fadeIn} 
                custom={1}
                className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]"
            >
                The Apex<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--f1-red)] to-[var(--accent-gold)]">Archive</span>
            </motion.h1>
            
            <motion.p 
                variants={fadeIn} 
                custom={2}
                className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed font-light"
            >
                Detailed documentation of all subsystems. From the prediction algorithm to global warfare. 
                Read this manual to maximize your telemetry output.
            </motion.p>
        </motion.div>

        {/* === MODULE 1: CORE_LOOP === */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-32 scroll-mt-24"
            id="core-loop"
        >
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white">01 /// CORE LOOP</h2>
                 <div className="mb-2 text-[var(--text-muted)] font-mono text-sm hidden md:block">PREDICTION_WORKFLOW</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <motion.div variants={fadeIn} custom={0}>
                     <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-6">
                        The prediction window opens immediately after the previous race concludes. 
                        You have full strategic control until the formation lap begins.
                     </p>
                     
                     <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)]">
                            <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-[var(--f1-red)]">
                                <Crosshair size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">LOCKOUT PROTOCOL</h4>
                                <p className="text-sm text-[var(--text-muted)]">Predictions are aggressively locked at the exact start time (Lights Out). No edits are permitted during the session.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-[var(--bg-onyx)] rounded-xl border border-[var(--glass-border)]">
                            <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-[var(--accent-cyan)]">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">DYNAMIC ADJUSTMENT</h4>
                                <p className="text-sm text-[var(--text-muted)]">Smart strategists adjust picks after Qualifying (Saturday). Analyzing grid position is key.</p>
                            </div>
                        </div>
                     </div>
                 </motion.div>

                 <motion.div variants={fadeIn} custom={1} className="relative">
                     <div className="absolute -inset-4 bg-gradient-to-r from-[var(--f1-red)]/20 to-[var(--accent-gold)]/20 blur-xl opacity-50 rounded-full" />
                     <GlassCard className="p-8 relative">
                         <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                             <span className="text-xs font-mono text-[var(--f1-red)] animate-pulse">● LIVE STATUS</span>
                             <span className="text-xs font-mono text-white/50">SYS_TIME: UTC</span>
                         </div>
                         <div className="space-y-4 font-mono text-sm">
                             <div className="flex justify-between">
                                 <span className="text-white/60">FP1 / FP2 / FP3</span>
                                 <span className="text-[var(--accent-cyan)]">OPEN</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-white/60">QUALIFYING</span>
                                 <span className="text-[var(--accent-cyan)]">OPEN</span>
                             </div>
                             <div className="flex justify-between p-2 bg-[var(--f1-red)]/10 rounded border border-[var(--f1-red)]/20">
                                 <span className="text-[var(--f1-red)] font-bold">RACE START</span>
                                 <span className="text-[var(--f1-red)] font-bold">LOCKED</span>
                             </div>
                         </div>
                     </GlassCard>
                 </motion.div>
            </div>
        </motion.section>

        {/* === MODULE 2: ALGORITHM === */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-32 scroll-mt-24"
            id="algorithm"
        >
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white">02 /// ALGORITHM</h2>
                 <div className="mb-2 text-[var(--text-muted)] font-mono text-sm hidden md:block">SCORING_MATRIX</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="p-6 col-span-1 lg:col-span-1 bg-[var(--f1-red)]/5 border-[var(--f1-red)]/20">
                    <div className="text-4xl font-black text-white font-orbitron mb-2">25<span className="text-lg text-[var(--f1-red)]">PTS</span></div>
                    <h3 className="text-lg font-bold text-white mb-2">RACE WINNER</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        High stakes. You must correctly predict the driver who takes P1. Anything else is 0.
                    </p>
                </GlassCard>
                
                <GlassCard className="p-6 col-span-1 lg:col-span-1 bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20">
                    <div className="text-4xl font-black text-white font-orbitron mb-2">15<span className="text-lg text-[var(--accent-gold)]">PTS</span></div>
                    <h3 className="text-lg font-bold text-white mb-2">PODIUM FINISH</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        Awarded if your chosen driver finishes in Top 3 (P1, P2, or P3). Safer bet.
                    </p>
                </GlassCard>

                <GlassCard className="p-6 col-span-1 lg:col-span-1 bg-[var(--accent-cyan)]/5 border-[var(--accent-cyan)]/20">
                    <div className="text-4xl font-black text-white font-orbitron mb-2">10<span className="text-lg text-[var(--accent-cyan)]">PTS</span></div>
                    <h3 className="text-lg font-bold text-white mb-2">BONUS METRICS</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                        <span className="text-white font-bold">Fastest Lap:</span> Official purple time.<br/>
                        <span className="text-white font-bold">DNF Count:</span> Exact number of retirements.
                    </p>
                </GlassCard>
            </div>
            
            <div className="mt-6 text-center text-xs font-mono text-[var(--text-muted)]">
                * MAXIMUM THEORETICAL SCORE PER WEEKEND: 60 POINTS
            </div>
        </motion.section>

        {/* === MODULE 3: INTELLIGENCE === */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-32 scroll-mt-24"
            id="intelligence"
        >
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white">03 /// INTELLIGENCE</h2>
                 <div className="mb-2 text-[var(--text-muted)] font-mono text-sm hidden md:block">DATA_STREAMS</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <motion.div variants={fadeIn} className="flex gap-4 items-start">
                     <Calendar className="text-[var(--text-muted)] mt-1" size={24} />
                     <div>
                         <h3 className="text-xl font-bold text-white mb-2">Race Calendar</h3>
                         <p className="text-[var(--text-muted)] leading-relaxed">
                            Full season synchronization. Track start times are automatically converted to your local time zone. 
                            Use the circuit view to check lap records and past winners.
                         </p>
                     </div>
                 </motion.div>
                 
                 <motion.div variants={fadeIn} className="flex gap-4 items-start">
                     <TrendingUp className="text-[var(--text-muted)] mt-1" size={24} />
                     <div>
                         <h3 className="text-xl font-bold text-white mb-2">Live Standings</h3>
                         <p className="text-[var(--text-muted)] leading-relaxed">
                            Real-time championship tables sourced directly from official FIA data feeds (Jolpica/Ergast).
                            Updated instantly after race classifications are finalized.
                         </p>
                     </div>
                 </motion.div>
            </div>
        </motion.section>

        {/* === MODULE 4: WARFARE === */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-32 scroll-mt-24"
            id="warfare"
        >
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white">04 /// WARFARE</h2>
                 <div className="mb-2 text-[var(--text-muted)] font-mono text-sm hidden md:block">SOCIAL_CONFLICT</div>
            </div>

            <div className="bg-[var(--bg-onyx)] border border-[var(--glass-border)] rounded-2xl p-8 md:p-12 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--f1-red)] opacity-[0.05] rounded-full blur-[100px] group-hover:opacity-[0.1] transition-opacity" />
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div>
                         <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                             <Users size={24} className="text-[var(--f1-red)]" />
                             Leagues
                         </h3>
                         <p className="text-[var(--text-secondary)] mb-6">
                            Create private grid for up to 50 players. 
                            As a Commissioner (Admin), you hold the keys.
                         </p>
                         <ul className="space-y-2 text-sm text-[var(--text-muted)] font-mono">
                             <li className="flex items-center gap-2"><span className="text-[var(--f1-red)]">›</span> GENERATE INVITE CODES</li>
                             <li className="flex items-center gap-2"><span className="text-[var(--f1-red)]">›</span> MANAGE GRID MEMBERS</li>
                         </ul>
                     </div>

                     <div>
                         <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                             <Crosshair size={24} className="text-[var(--accent-cyan)]" />
                             Rivalries
                         </h3>
                         <p className="text-[var(--text-secondary)] mb-6">
                            Direct 1v1 Hostility. Mark another user as your Rival to activate Head-to-Head tracking. 
                            The system will generate a diff report after every race.
                         </p>
                         <F1Button variant="outline" size="sm" className="pointer-events-none opacity-50">
                             VIEW_RIVALRY_CARD [DEMO]
                         </F1Button>
                     </div>
                </div>
            </div>
        </motion.section>

        {/* === MODULE 5: PROGRESSION === */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-24 scroll-mt-24"
            id="progression"
        >
            <div className="flex items-end gap-4 mb-12 border-b border-white/10 pb-6">
                 <h2 className="text-4xl md:text-5xl font-black font-orbitron text-white">05 /// PROGRESSION</h2>
                 <div className="mb-2 text-[var(--text-muted)] font-mono text-sm hidden md:block">CAREER_STATS</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <motion.div variants={fadeIn} className="p-6 border border-white/5 rounded-xl bg-[var(--bg-carbon)]">
                     <div className="text-[var(--accent-gold)] text-4xl mb-4">🏆</div>
                     <h3 className="text-lg font-bold text-white mb-2">Global Ranking</h3>
                     <p className="text-xs text-[var(--text-muted)]">Your percentile against the entire userbase.</p>
                 </motion.div>
                 
                 <motion.div variants={fadeIn} className="p-6 border border-white/5 rounded-xl bg-[var(--bg-carbon)]">
                     <div className="text-[var(--f1-red)] text-4xl mb-4">🔥</div>
                     <h3 className="text-lg font-bold text-white mb-2">Streak Multipliers</h3>
                     <p className="text-xs text-[var(--text-muted)]">Consistent correct picks ignite your streak flame.</p>
                 </motion.div>

                 <motion.div variants={fadeIn} className="p-6 border border-white/5 rounded-xl bg-[var(--bg-carbon)]">
                     <div className="text-[var(--accent-cyan)] text-4xl mb-4">📊</div>
                     <h3 className="text-lg font-bold text-white mb-2">Accuracy Matrix</h3>
                     <p className="text-xs text-[var(--text-muted)]">Visual breakdown of your P1 pick efficiency.</p>
                 </motion.div>
            </div>
        </motion.section>

        {/* CTA */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center py-24 border-t border-white/5"
        >
             <h2 className="text-xl text-[var(--text-muted)] font-mono mb-8">
                SYSTEM BRIEFING COMPLETE.
             </h2>
             <Link href="/">
                <F1Button variant="primary" size="lg" className="min-w-[200px] shadow-[0_0_50px_rgba(255,24,1,0.2)]">
                    ENTER COMMAND CENTER
                </F1Button>
             </Link>
        </motion.div>

      </div>
    </div>
  );
}
