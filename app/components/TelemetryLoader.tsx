"use client";

import { useEffect, useState } from "react";

interface TelemetryLoaderProps {
  onComplete?: () => void;
}

export default function TelemetryLoader({ onComplete }: TelemetryLoaderProps) {
  const [bootStep, setBootStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { text: "BIOS_CHECK_OK", delay: 300 },
    { text: "ESTABLISHING_UPLINK...", delay: 800 },
    { text: "CALIBRATING_SENSORS", delay: 600 },
    { text: "FETCHING_2026_GRID_DATA...", delay: 1000 },
    { text: "SYNCING_RACE_CONTROL", delay: 500 },
    { text: "SYSTEM_READY", delay: 400 }
  ];

  useEffect(() => {
    let currentStep = 0;
    
    // Total estimated duration to sync progress bar roughly with steps
    const totalDuration = steps.reduce((acc, step) => acc + step.delay, 0) + 500; 
    const startTime = Date.now();

    // Progress Bar Animation
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(calculatedProgress);
      
      if (calculatedProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 16);

    // Step Sequencer
    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setBootStep(i);
        await new Promise(r => setTimeout(r, steps[i].delay));
      }
      // Finished
      setTimeout(() => {
        onComplete?.();
      }, 500);
    };

    runSteps();

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-void)] flex flex-col items-center justify-center font-mono text-[var(--text-primary)]">
      
      {/* Background Grid Illusion (Subtle) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md p-6 relative">
        {/* Terminal Window Header */}
        <div className="flex justify-between items-center mb-6 text-[10px] text-[var(--text-muted)] tracking-widest uppercase border-b border-white/10 pb-2">
            <span>F1-APEX-OS v2.6.0</span>
            <span className="animate-pulse text-[var(--status-success)]">● ONLINE</span>
        </div>

        {/* Boot Sequence Log */}
        <div className="h-48 flex flex-col justify-end mb-8 space-y-1 font-mono text-xs md:text-sm">
            {steps.map((step, index) => {
                if (index > bootStep) return null;
                const isCurrent = index === bootStep;
                return (
                    <div key={index} className={`flex items-center gap-3 ${isCurrent ? 'text-[var(--accent-cyan)]' : 'text-white/40'}`}>
                        <span className="opacity-50 text-[10px] w-12">{`00:${20 + index * 14}`}</span>
                        <span>{step.text}</span>
                        {isCurrent && <span className="w-2 h-4 bg-[var(--accent-cyan)] animate-pulse ml-1 inline-block align-middle"/>}
                        {!isCurrent && <span className="text-[var(--status-success)] ml-auto">[OK]</span>}
                    </div>
                )
            })}
        </div>

        {/* Progress System */}
        <div className="relative">
            <div className="flex justify-between text-[10px] text-[var(--accent-cyan)] mb-1 uppercase tracking-wider font-bold">
                <span>System Initialization</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)] transition-all duration-75 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        {/* Decorative Speed Lines */}
        <div className="absolute top-1/2 -left-12 w-[1px] h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute top-1/2 -right-12 w-[1px] h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

      </div>
    </div>
  );
}
