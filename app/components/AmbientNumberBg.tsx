"use client";

interface AmbientNumberBgProps {
  /** The number or text to display (e.g., "16", "2026", "F1") */
  number: string;
  /** The color for the number stroke and glow */
  color?: string;
  /** Opacity of the number (0-100) */
  opacity?: number;
}

/**
 * Full-page ambient number background effect.
 * Creates a large decorative number with team-colored glow.
 */
export default function AmbientNumberBg({
  number,
  color = "#FF1801",
  opacity = 20,
}: AmbientNumberBgProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full blur-[150px]"
        style={{ 
          backgroundColor: color,
          opacity: opacity / 100 
        }}
      />
      {/* The massive number */}
      <span
        className="absolute -bottom-20 -right-10 font-black italic leading-none select-none"
        style={{
          fontSize: "clamp(20rem, 50vw, 50rem)",
          color: "transparent",
          WebkitTextStroke: `3px ${color}25`,
          textShadow: `0 0 100px ${color}15`,
          fontFamily: "var(--font-orbitron), sans-serif",
        }}
      >
        {number}
      </span>
    </div>
  );
}
