import { TRACK_PATHS } from "../lib/trackPaths";

interface TrackMapProps {
  code: string;
  className?: string;
  variant?: 'default' | 'gold' | 'cyan' | 'red';
}

export default function TrackMap({ code, className = "", variant = 'gold' }: TrackMapProps) {
  // Use specific track or fallback to a generic shape (AUS is a good generic closed loop if GP is missing)
  const path = TRACK_PATHS[code] || TRACK_PATHS["AUS"]; 
  
  // Define variant styles for stroke color and glow shadow
  // Using Tailwind's group-hover to allow parent interaction
  const variantStyles = {
    default: "stroke-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]",
    gold: "stroke-[var(--accent-gold)] drop-shadow-[0_0_4px_rgba(245,194,66,0.5)] group-hover:drop-shadow-[0_0_8px_rgba(245,194,66,0.8)]",
    cyan: "stroke-[var(--accent-cyan)] drop-shadow-[0_0_4px_rgba(0,212,255,0.5)] group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]",
    red: "stroke-[var(--f1-red)] drop-shadow-[0_0_4px_rgba(255,24,1,0.5)] group-hover:drop-shadow-[0_0_8px_rgba(255,24,1,0.8)]",
  };

  const pathId = `track-path-${code}`;
  const gradientId = `telemetry-gradient-${code}`;

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className} group/track`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D103D1" />   {/* Purple Sector */}
            <stop offset="30%" stopColor="#00FF00" />  {/* Green Sector */}
            <stop offset="60%" stopColor="#FFFFFF" />  {/* Neutral Sector */}
            <stop offset="100%" stopColor="#FFE600" /> {/* Yellow Sector */}
          </linearGradient>
        </defs>

        {/* Base Track Trace (Darker underlay) */}
        <path
          d={path}
          fill="none"
          strokeWidth="3"
          stroke="rgba(0,0,0,0.5)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Track Line with Gradient or Variant Color */}
        <path
          id={pathId}
          d={path}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={variant === 'gold' ? `url(#${gradientId})` : undefined}
          className={`transition-all duration-500 ease-out ${variant !== 'gold' ? variantStyles[variant] : 'drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]'}`}
        />

        {/* Ghost Car Animation (Only on Gold/Featured variants) */}
        {variant === 'gold' && (
          <circle r="2" fill="white" className="drop-shadow-[0_0_8px_white]">
            <animateMotion 
              dur="6s" 
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        )}
      </svg>
    </div>
  );
}
