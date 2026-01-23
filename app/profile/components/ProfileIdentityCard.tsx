"use client";
import { useState } from "react";
import { GRID_DATA, TeamConfig } from "@/app/lib/gridData";
import { Profile } from "@/app/lib/types";

interface ProfileIdentityCardProps {
  profile: Profile;
  isOwner: boolean;
  onEdit: () => void;
  onSettings: () => void;
}

export default function ProfileIdentityCard({ profile, isOwner, onEdit, onSettings }: ProfileIdentityCardProps) {
  // 1. Resolve Team Configuration
  // Fallback to "ferrari" or a generic config if user has no team or invalid team
  const userTeamKey = profile.favorite_team?.toLowerCase().replace(/\s+/g, "") || "ferrari"; 
  // Attempt to match broadly (e.g. "Scuderia Ferrari" -> "ferrari")
  // For now, simpler: check if GRID_DATA has the exact key, else find by name inclusion, else default
  
  let teamConfig: TeamConfig | undefined = GRID_DATA[userTeamKey];
  
  if (!teamConfig) {
      // Try finding by name
      const foundKey = Object.keys(GRID_DATA).find(k => 
          GRID_DATA[k].name.toLowerCase().includes(userTeamKey) || 
          userTeamKey.includes(k)
      );
      if (foundKey) teamConfig = GRID_DATA[foundKey];
  }

  // Final fallback
  if (!teamConfig) teamConfig = GRID_DATA["ferrari"]; // Default to something valid

  // 2. Resolve Driver Number
  // If user has a favorite driver, try to find their number in the team config
  // Or just use a generic number if not found
  let bigNumber = "00";
  if (profile.favorite_driver) {
      // Try to find driver in the matched team
      const driverKey = Object.keys(teamConfig.drivers).find(k => 
         teamConfig?.drivers[k].name === profile.favorite_driver
      );
      if (driverKey) {
          bigNumber = teamConfig.drivers[driverKey].number;
      } else {
          // If driver not in this team (mismatch), try to find number globally (simplified: just use "01")
          // In a real app we'd search all teams. For now, fallback to team's first driver
          const firstDriver = Object.values(teamConfig.drivers)[0];
          bigNumber = firstDriver ? firstDriver.number : "01";
      }
  } else {
       // user has no favorite driver, use Team's driver #1
       const firstDriver = Object.values(teamConfig.drivers)[0];
       bigNumber = firstDriver ? firstDriver.number : "01";
  }

  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl border transition-colors duration-500 group"
         style={{ 
             borderColor: teamConfig.color,
             backgroundColor: "rgba(15, 23, 42, 0.6)" // bg-gray-900/60
         }}
    >
        {/* ... (Big Number and Decorators remain same) ... */}
        {/* === A. THE BIG NUMBER (Background) === */}
        <div className="absolute -bottom-16 -right-16 select-none leading-none pointer-events-none z-0">
             <span 
                className="font-black italic"
                style={{
                    fontSize: "14rem",
                    color: "transparent",
                    WebkitTextStroke: "2px rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-orbitron), sans-serif"
                }}
             >
                 {bigNumber}
             </span>
        </div>

        {/* Technical Decorators */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/30" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/30" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/30" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/30" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center pt-16 px-6 pb-8 h-full">
            
            {/* === C. THE AVATAR (Team Badge) === */}
            <div className="relative mb-10 group/avatar">
                <div 
                    className="w-32 h-32 rounded-full backdrop-blur-md flex items-center justify-center border-2 border-dashed shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover/avatar:scale-105"
                    style={{ 
                        borderColor: teamConfig.color,
                        backgroundColor: "rgba(255,255,255,0.05)"
                    }}
                >
                    {!imgError ? (
                        <img 
                            src={teamConfig.logo} 
                            alt={teamConfig.name}
                            className="w-20 h-20 object-contain drop-shadow-md pb-1"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span style={{ fontSize: "2.5rem", fontWeight: "900", color: "white", letterSpacing: "1px" }}>
                            {teamConfig.abbreviation}
                        </span>
                    )}
                </div>

                {/* Status Dot */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[var(--status-success)] rounded-full border-2 border-gray-900 animate-pulse shadow-[0_0_10px_var(--status-success)]" title="System Online" />
            </div>

            {/* === NAME & TAG === */}
            <h1 className="text-3xl font-black text-white text-center uppercase tracking-tight mb-3 font-mono break-all line-clamp-1">
                {profile.username}
            </h1>
            
            <div 
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-12 border border-white/5 bg-white/5"
                style={{ 
                    color: teamConfig.color
                }}
            >
                {teamConfig.name.toUpperCase()} • #{bigNumber}
            </div>


            {/* === D. DATA FIELDS (Standardized Identity) === */}
            <div className="w-full space-y-5 px-2">
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">LICENSE_ID</span>
                     <span className="text-white font-bold font-mono text-base">{profile.id.substring(0,8).toUpperCase()}</span>
                 </div>

                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">Nationality</span>
                     <span className="text-white font-bold font-mono text-base">GLOBAL</span>
                 </div>

                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">Role</span>
                     <span className="text-[var(--accent-gold)] font-bold font-mono text-base shadow-[0_0_15px_rgba(255,215,0,0.2)]">DRIVER</span>
                 </div>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">Team Principal</span>
                     <span className="text-white font-bold font-mono text-base pointer-events-none opacity-50">--</span>
                 </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Actions */}
            {isOwner && (
                <div className="w-full grid grid-cols-2 gap-3 mt-8">
                    <button 
                         onClick={onEdit}
                         className="py-3 border border-dashed border-gray-600 text-[10px] font-mono text-gray-400 hover:text-white hover:border-white hover:bg-white/5 transition-all uppercase tracking-wider font-bold rounded-sm"
                    >
                        EDIT_DATA
                    </button>
                    <button 
                         onClick={onSettings}
                         className="py-3 border border-dashed border-gray-600 text-[10px] font-mono text-gray-400 hover:text-white hover:border-white hover:bg-white/5 transition-all uppercase tracking-wider font-bold rounded-sm"
                    >
                        SYS_CONFIG
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}
