"use client";
import { useState, useEffect } from "react";

interface LaunchSequenceProps {
  targetTime: Date | string;
  onLock?: () => void;
  label?: string;
  showSeconds?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function LaunchSequence({ 
  targetTime, 
  onLock,
  label = "PREDICTION WINDOW CLOSES",
  showSeconds = true
}: LaunchSequenceProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const target = typeof targetTime === 'string' ? new Date(targetTime) : targetTime;
    
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      };
    };

    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    
    if (initial.total <= 0) {
      setIsLocked(true);
      onLock?.();
    }

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      
      if (updated.total <= 0 && !isLocked) {
        setIsLocked(true);
        onLock?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onLock, isLocked]);

  if (!timeLeft) return null;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (isLocked) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-6 md:p-8 backdrop-blur-sm">
         <div className="absolute inset-0 flex items-center justify-center bg-[var(--f1-red)]/20 z-10">
            <span className="text-xl md:text-2xl font-black font-orbitron tracking-widest text-white animate-pulse">SESSION LOCKED</span>
         </div>
      </div>
    );
  }

  // Calculate criticality for color
  const hoursRemaining = timeLeft.days * 24 + timeLeft.hours;
  const isCritical = timeLeft.days === 0 && timeLeft.hours < 1;
  const isWarning = timeLeft.days === 0 && timeLeft.hours < 24;

  const digitColor = isCritical ? 'text-[var(--f1-red)]' : isWarning ? 'text-[var(--accent-gold)]' : 'text-white';
  const glowShadow = isCritical ? 'drop-shadow-[0_0_10px_rgba(225,6,0,0.5)]' : isWarning ? 'drop-shadow-[0_0_8px_rgba(201,169,98,0.4)]' : '';

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
         <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--text-muted)]">{label}</div>
         <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-[var(--f1-red)] animate-ping' : 'bg-[var(--accent-cyan)]'}`} />
      </div>

      {/* Digital Timer */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 p-4 rounded-xl bg-black/60 border border-white/10 shadow-inner">
         {/* Days */}
         <div className="flex flex-col items-center">
            <div className={`text-3xl md:text-5xl font-black font-mono tracking-tighter ${digitColor} ${glowShadow}`}>
               <SlotCounter value={timeLeft.days} />
            </div>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Days</span>
         </div>

         {/* Hours */}
         <div className="flex flex-col items-center relative">
            <div className={`text-3xl md:text-5xl font-black font-mono tracking-tighter ${digitColor} ${glowShadow}`}>
               <SlotCounter value={timeLeft.hours} />
            </div>
             <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Hrs</span>
             {/* Divider Dots */}
             <div className="absolute -left-2 md:-left-3 top-2 md:top-4 text-white/20 text-2xl animate-pulse">:</div>
         </div>

         {/* Minutes */}
         <div className="flex flex-col items-center relative">
            <div className={`text-3xl md:text-5xl font-black font-mono tracking-tighter ${digitColor} ${glowShadow}`}>
               <SlotCounter value={timeLeft.minutes} />
            </div>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Min</span>
            <div className="absolute -left-2 md:-left-3 top-2 md:top-4 text-white/20 text-2xl animate-pulse">:</div>
         </div>

         {/* Seconds */}
         <div className="flex flex-col items-center relative">
            <div className={`text-3xl md:text-5xl font-black font-mono tracking-tighter ${showSeconds ? digitColor : 'text-[var(--text-subtle)]'} ${glowShadow}`}>
               {showSeconds ? <SlotCounter value={timeLeft.seconds} /> : '--'}
            </div>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Sec</span>
             <div className="absolute -left-2 md:-left-3 top-2 md:top-4 text-white/20 text-2xl animate-pulse">:</div>
         </div>
      </div>
    </div>
  );
}

const SlotCounter = ({ value }: { value: number }) => {
  const str = value.toString().padStart(2, '0');
  return (
    <div className="flex">
      {str.split('').map((char, i) => (
        <div key={i} className="relative overflow-hidden h-[1em] w-[0.6em]">
          <span key={char} className="absolute inset-0 flex items-center justify-center animate-slide-up">
            {char}
          </span>
        </div>
      ))}
    </div>
  );
};
