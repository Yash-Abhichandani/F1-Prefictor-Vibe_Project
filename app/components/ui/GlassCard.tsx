import React from 'react';

type CardVariant = 'default' | 'gold' | 'red' | 'cyber';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  withNoise?: boolean;
  id?: string;
}

export default function GlassCard({ 
  children, 
  variant = 'default', 
  className = '',
  interactive = false,
  withNoise = false,
  onClick,
  id
}: GlassCardProps) {
  
  const getBaseClass = () => {
    switch (variant) {
      case 'gold': return 'glass-card-gold';
      case 'red': return 'glass-card border-[rgba(225,6,0,0.3)] shadow-[0_0_20px_rgba(225,6,0,0.1)]';
      case 'cyber': return 'glass-card border-[var(--accent-cyan)] shadow-[0_0_20px_rgba(0,212,255,0.1)]';
      default: return 'glass-card';
    }
  };

  const interactiveClass = interactive 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer hover:border-opacity-50' 
    : '';
    
  const noiseClass = withNoise ? 'bg-noise' : '';

  return (
    <div 
      id={id}
      className={`${getBaseClass()} ${interactiveClass} ${noiseClass} ${className}`}
      onClick={onClick}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      {children}
    </div>
  );
}
