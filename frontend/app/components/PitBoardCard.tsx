"use client";
import { useState, useRef, useEffect } from "react";

// Track circuit outlines (simplified SVG paths for 2026 calendar)
const TRACK_PATHS: Record<string, string> = {
  AUS: "M10,50 Q20,20 40,30 Q60,40 70,20 Q80,30 90,50 Q80,70 60,60 Q40,70 20,60 Q10,70 10,50",
  BHR: "M20,30 L80,30 L80,50 L60,50 L60,70 L40,70 L40,50 L20,50 Z",
  SAU: "M10,70 L30,20 L50,40 L70,20 L90,70 L70,60 L50,80 L30,60 Z",
  JPN: "M20,50 Q30,20 50,30 Q70,40 80,20 Q90,40 90,60 Q80,80 50,70 Q30,80 20,50",
  CHN: "M20,40 L40,20 L60,30 L80,20 L80,50 L60,60 L80,80 L40,80 L20,60 Z",
  MIA: "M20,30 L50,30 L50,50 L80,50 L80,70 L20,70 Z",
  ITA: "M20,50 L40,20 L60,40 L80,20 L80,80 L60,60 L40,80 L20,50",
  MCO: "M30,30 Q50,20 70,30 L80,50 Q70,70 50,80 Q30,70 20,50 L30,30",
  ESP: "M20,40 L40,20 L60,40 L80,20 L80,60 L60,80 L40,60 L20,80 L20,40",
  CAN: "M20,70 L40,30 L60,50 L80,20 L80,80 L60,70 L40,80 L20,70",
  AUT: "M30,50 L50,20 L70,50 L90,30 L90,70 L70,50 L50,80 L30,50",
  GBR: "M20,50 Q40,20 60,40 Q80,60 60,80 Q40,60 20,50",
  HUN: "M20,30 L50,30 Q60,40 50,50 L80,50 L80,70 L20,70 Z",
  BEL: "M20,60 L40,20 L60,40 L80,30 L90,70 L60,60 L40,80 L20,60",
  NED: "M20,50 L40,20 L60,50 L80,30 L80,70 L60,50 L40,80 L20,50",
  MAD: "M30,30 L70,30 L70,50 L50,50 L50,70 L30,70 Z",
  AZE: "M20,50 L80,50 L80,30 L90,50 L80,70 L80,50 L20,50 L20,30 L10,50 L20,70 Z",
  SGP: "M30,30 L70,30 L70,50 L50,50 L50,70 L70,70 L70,50 L90,50 L90,70 L30,70 Z",
  USA: "M20,50 L50,20 L80,50 L80,80 L50,60 L20,80 Z",
  MEX: "M20,50 Q40,20 60,50 Q80,80 60,50 Q40,20 20,50",
  BRA: "M20,60 L40,30 L60,40 L80,20 L80,70 L60,60 L40,80 L20,60",
  LVS: "M20,70 L20,30 L40,30 L40,50 L60,50 L60,30 L80,30 L80,70 Z",
  QAT: "M30,50 L50,20 L70,50 L50,80 Z",
  ABU: "M20,50 L40,20 L60,20 L80,50 L60,80 L40,80 Z"
};

interface PitBoardCardProps {
  raceCode: string;
  raceName: string;
  circuit: string;
  qualiTime?: string;
  raceTime: string;
  isActive?: boolean;
  isPast?: boolean;
  onClick?: () => void;
}

export default function PitBoardCard({
  raceCode,
  raceName,
  circuit,
  qualiTime,
  raceTime,
  isActive = false,
  isPast = false,
  onClick
}: PitBoardCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const trackPath = TRACK_PATHS[raceCode] || TRACK_PATHS.AUS;
  
  const formatLocalTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className={`pit-board ${isActive ? 'pit-board-active' : ''} ${isPast ? 'opacity-40' : ''} 
        w-[280px] md:w-[320px] p-6 transition-all duration-300 cursor-pointer
        hover:border-[var(--accent-cyan)] hover:shadow-[0_0_20px_rgba(69,162,158,0.3)]`}
      onClick={onClick}
    >
      {/* Country Code */}
      <div className="font-orbitron text-5xl md:text-6xl font-black text-white tracking-wider mb-4">
        {raceCode}
      </div>
      
      {/* Track Outline */}
      <div className="relative h-24 mb-4">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ filter: isActive ? 'drop-shadow(0 0 10px var(--accent-cyan))' : 'none' }}
        >
          <path 
            d={trackPath}
            fill="none"
            stroke={isActive ? 'var(--accent-cyan)' : 'var(--text-silver)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isPast ? 'opacity-30' : ''}
          />
          {/* Start/Finish line */}
          <circle 
            cx="20" 
            cy="50" 
            r="3" 
            fill={isActive ? 'var(--success-green)' : 'var(--alert-red)'}
          />
        </svg>
      </div>
      
      {/* Race Name (short) */}
      <div className="text-sm text-[var(--text-silver)] font-mono truncate mb-4">
        {circuit}
      </div>
      
      {/* Session Intel Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className="w-full flex items-center justify-between py-2 px-4 bg-[var(--bg-carbon)] 
          border border-[var(--glass-border)] text-xs font-orbitron tracking-wider
          hover:border-[var(--accent-cyan)] transition-colors"
      >
        <span className="text-[var(--accent-cyan)]">SESSION INTEL</span>
        <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {/* Expandable Session Times */}
      {isExpanded && (
        <div className="mt-4 space-y-3 text-xs font-mono animate-fadeIn">
          {qualiTime && (
            <div className="flex justify-between items-center py-2 border-b border-[var(--glass-border)]">
              <span className="text-[var(--alert-red)] font-bold">QUALIFYING</span>
              <span className="text-[var(--text-silver)]">{formatLocalTime(qualiTime)}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-bold">RACE</span>
            <span className="text-[var(--text-silver)]">{formatLocalTime(raceTime)}</span>
          </div>
        </div>
      )}
      
      {/* Status Indicator */}
      {isActive && (
        <div className="mt-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--success-green)] animate-pulse" />
          <span className="text-xs font-mono text-[var(--success-green)] uppercase">Live</span>
        </div>
      )}
    </div>
  );
}
