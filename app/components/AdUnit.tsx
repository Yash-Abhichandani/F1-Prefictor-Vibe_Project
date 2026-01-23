"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdUnit({ 
  slot, 
  format = "auto", 
  className = "",
  label = "Advertisement",
  responsive = true,
  style = {}
}: AdUnitProps) {
  
  // Track if ad has already been initialized to prevent re-pushes
  const adInitialized = useRef(false);
  const adRef = useRef<HTMLModElement>(null);
  
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Skip ad loading in development mode entirely
    if (isDev) return;
    
    // Prevent double initialization (React Strict Mode / Fast Refresh)
    if (adInitialized.current) return;
    
    // Check if the ad slot already has content
    if (adRef.current && adRef.current.hasChildNodes()) {
      adInitialized.current = true;
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adRef.current) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adInitialized.current = true;
        }
      } catch (err) {
        // Silently ignore - this error is common and non-critical
        console.warn("AdSense warning:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isDev, slot]);

  // Development placeholder
  if (isDev) {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-8 ${className}`}>
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-subtle)] mb-2 opacity-50">
          {label}
        </span>
        <div className="w-full max-w-[728px] h-[90px] bg-[var(--bg-graphite)]/50 border border-dashed border-[var(--glass-border)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
          [AdSpace: {slot}]
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center my-8 ${className}`}>
      {/* Label for transparency */}
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-subtle)] mb-2 opacity-50">
        {label}
      </span>

      {/* Actual Ad Unit */}
      <div className="w-full flex justify-center overflow-hidden min-h-[100px] bg-[var(--bg-graphite)]/20 rounded-lg">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", ...style }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
