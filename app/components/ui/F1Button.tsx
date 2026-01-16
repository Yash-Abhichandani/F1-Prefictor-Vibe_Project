import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'teal' | 'ghost' | 'outline' | 'danger';

interface F1ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  isLoading?: boolean;
  pulse?: boolean;
}

export default function F1Button({
  children,
  variant = 'gold',
  size = 'md',
  href,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  icon,
  isLoading = false,
  pulse = false
}: F1ButtonProps) {
  
  let btnClass = '';
  switch (variant) {
    case 'primary': btnClass = 'btn-primary'; break;
    case 'secondary': btnClass = 'btn-secondary'; break;
    case 'gold': btnClass = 'btn-gold'; break;
    case 'teal': btnClass = 'btn-teal'; break;
    case 'ghost': btnClass = 'btn-ghost'; break;
    case 'outline': btnClass = 'btn-ghost border border-[var(--glass-border)] hover:border-white'; break;
    case 'danger': btnClass = 'bg-[var(--f1-red)] text-white hover:bg-[var(--f1-red-bright)] hover:shadow-glow-red transition-all rounded-lg font-bold'; break;
    default: btnClass = 'btn-gold';
  }
  
  let sizeClass = '';
  switch (size) {
    case 'sm': sizeClass = 'px-3 py-1.5 text-xs'; break;
    case 'md': sizeClass = 'px-5 py-2.5 text-sm'; break;
    case 'lg': sizeClass = 'px-8 py-4 text-lg'; break;
    case 'xl': sizeClass = 'px-10 py-5 text-xl font-bold tracking-wide'; break;
  }

  const pulseClass = pulse ? 'animate-pulse-slow' : '';
  const loadingClass = isLoading ? 'opacity-70 cursor-wait' : '';
  
  const classes = `${btnClass} ${sizeClass} ${pulseClass} ${loadingClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} inline-flex items-center justify-center gap-2 transition-transform active:scale-95`;
  
  const content = (
    <>
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="text-lg">{icon}</span>
      ) : null}
      <span>{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {content}
    </button>
  );
}
