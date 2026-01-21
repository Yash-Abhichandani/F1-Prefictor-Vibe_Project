"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Script from "next/script";
import GlassCard from "./ui/GlassCard";
import F1Button from "./ui/F1Button";

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeveloperModal({ isOpen, onClose }: DeveloperModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Script 
              src="https://platform.linkedin.com/badges/js/profile.js" 
              strategy="lazyOnload" 
              async 
              defer 
            />

            <GlassCard variant="default" className="relative overflow-hidden border-2 border-[var(--accent-gold)]/30 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors z-20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--f1-red)] to-[var(--accent-gold)] mb-4 shadow-lg shadow-[var(--f1-red)]/20">
                  <span className="text-2xl font-bold text-white">YA</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Yash Abhichandani</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--accent-gold)] font-medium uppercase tracking-wider">
                  <span>Student</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <span>Developer</span>
                </div>
              </div>

              {/* LinkedIn Badge Container */}
              <div className="bg-white rounded-xl overflow-hidden shadow-inner min-h-[300px] flex items-center justify-center p-4">
                <div 
                  className="badge-base LI-profile-badge" 
                  data-locale="en_US" 
                  data-size="medium" 
                  data-theme="dark" 
                  data-type="VERTICAL" 
                  data-vanity="yash-abhichandani-6655a7371" 
                  data-version="v1"
                >
                  <a 
                    className="badge-base__link LI-simple-link" 
                    href="https://in.linkedin.com/in/yash-abhichandani-6655a7371?trk=profile-badge"
                  >
                    Yash Abhichandani
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                 <p className="text-xs text-[var(--text-muted)] italic mb-4">
                   "Building cool things, one race at a time."
                 </p>
                 <F1Button variant="secondary" onClick={onClose} className="w-full">
                    Close Card
                 </F1Button>
              </div>

            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
