"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
  variant?: 'default' | 'f1' | 'minimal';
}

export default function LoadingSpinner({ 
  message = "FETCHING TELEMETRY...", 
  variant = 'f1' 
}: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-[var(--accent-gold)]/30 border-t-[var(--accent-gold)] rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-muted)] animate-pulse">{message}</span>
      </div>
    );
  }

  // High-Fidelity 2026 F1 Wireframe Path (Side Profile)
  // Features: Halo, Shark Fin, Rear Wing Endplates, Floor, Nose Cone
  const f1CarPath = "M45,85 L25,85 C20,85 15,80 15,75 L20,70 L40,65 L100,58 L140,50 L160,50 L170,42 L190,40 L300,40 L330,30 L350,30 L360,70 L350,75 L330,75 M60,65 L80,62 L100,60 M140,50 L155,38 L170,50 M175,42 L175,25 L220,25 L220,40 M330,30 L330,15 L360,18 L360,30 M65,85 A14,14 0 1,1 93,85 A14,14 0 1,1 65,85 M280,85 A15,15 0 1,1 310,85 A15,15 0 1,1 280,85 M190,40 L260,35 L280,40 M195,40 C195,35 210,35 215,40";

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Central Content */}
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-xl">
        
        {/* The Aero Scan Container */}
        <div className="relative w-96 h-32 mb-8">
            {/* Inactive Wireframe (Base Layer - Ghost) */}
            <svg viewBox="0 0 400 120" className="absolute inset-0 w-full h-full opacity-10">
                <path 
                    d={f1CarPath}
                    fill="none" 
                    stroke="white" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>

            {/* Active Wireframe (Scanned Layer - Red) */}
            {/* We use a masking div that slides across to reveal this layer */}
            <div className="absolute inset-0 w-full h-full animate-scan-reveal">
                <svg viewBox="0 0 400 120" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,24,1,0.8)]">
                    <path 
                        d={f1CarPath}
                        fill="none" 
                        stroke="var(--f1-red)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* The Scan Line (Laser) - Synced with the mask */}
            <div className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--f1-red)] to-transparent blur-[1px] animate-scan-slide shadow-[0_0_15px_var(--f1-red)] hue-rotate-0"></div>
        </div>

        {/* Text Update */}
        <div className="text-[var(--f1-red)] font-mono font-bold tracking-[0.2em] text-sm uppercase flex items-center gap-1">
          <span className="animate-[pulse_2s_infinite]">FETCHING TELEMETRY</span>
          <span className="animate-pulse">_</span>
        </div>

      </div>
    </div>
  );
}
