"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import F1Button from "./ui/F1Button";
import Badge from "./ui/Badge";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile?: any;
  onLogout: () => void;
}

export default function MobileMenu({ isOpen, onClose, user, profile, onLogout }: MobileMenuProps) {
  // Prevent body scroll when open - using a safer method for mobile
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const baseNavLinks = [
    { href: '/calendar', label: 'Calendar', icon: '📅', text: 'Race Schedule' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', text: 'Global Rankings' },
    { href: '/standings', label: 'Standings', icon: '📊', text: 'F1 Championship' },
    { href: '/leagues', label: 'Leagues', icon: '👥', text: 'Join or Create' },
    { href: '/rivalries', label: 'Rivalries', icon: '⚔️', text: 'Head-to-Head' },
    { href: '/friends', label: 'Friends', icon: '👋', text: 'Social Hub' },
    { href: '/guide', label: 'System Manual', icon: '📖', text: 'How to Play' },
  ];

  const navLinks = profile?.is_admin 
    ? [...baseNavLinks, { href: '/admin', label: 'Admin', icon: '⚡', text: 'Authorized Only' }]
    : baseNavLinks;

  if (!isOpen) return null;

  // Handle close with touch support
  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
        {/* Backdrop - removed backdrop-blur for better mobile performance */}
        <div 
          className="absolute inset-0 bg-black/70 animate-fade-in"
          onClick={handleBackdropClick}
          onTouchEnd={handleBackdropClick}
        />
        
        {/* Drawer */}
        <div 
            className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#0a0a0c] border-l border-[var(--glass-border)] shadow-2xl flex flex-col animate-slide-in-right"
        >
            {/* Header */}
            <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
                <span className="text-xl font-bold text-white tracking-wider">MENU</span>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-onyx)] text-[var(--text-muted)] hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* User Section */}
            <div className="p-6 bg-[var(--bg-onyx)]/30 border-b border-[var(--glass-border)]">
                {user ? (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/60 flex items-center justify-center text-black font-bold text-lg shadow-[var(--shadow-glow-gold)]">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-xs text-[var(--accent-gold)] font-bold uppercase tracking-wider mb-0.5">Welcome Racer</div>
                            <div className="text-sm font-medium text-white truncate max-w-[150px]">
                                {user.email?.split('@')[0]}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link 
                        href="/login" 
                        onClick={onClose}
                    >
                        <F1Button variant="primary" className="w-full">Log In / Sign Up</F1Button>
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {navLinks.map((link) => (
                    <Link 
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--bg-onyx)] active:bg-[var(--bg-surface)] transition-colors group"
                    >
                        <span className="text-2xl opacity-70 group-hover:scale-110 transition-transform">{link.icon}</span>
                        <div>
                            <div className="font-bold text-white text-base group-hover:text-[var(--accent-cyan)] transition-colors">
                                {link.label}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                                {link.text}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[var(--glass-border)] bg-[var(--bg-void)]">
                {user && (
                    <>
                        <Link 
                            href="/profile" 
                            onClick={onClose}
                            className="flex items-center justify-between p-3 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-onyx)] mb-2 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                👤 My Profile
                            </span>
                            <span className="text-xs bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] px-2 py-0.5 rounded">NEW</span>
                        </Link>
                        <button 
                            onClick={() => {
                                onLogout();
                                onClose();
                            }}
                            className="w-full py-3 rounded-lg border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--alert-red)] hover:border-[var(--alert-red)] transition-colors text-sm font-bold uppercase tracking-wider"
                        >
                            Log Out
                        </button>
                    </>
                )}
                {!user && (
                    <div className="text-center text-xs text-[var(--text-muted)] opacity-50">
                        F1 Apex v1.0
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
