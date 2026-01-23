"use client";
import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  delay?: number;
}

export default function GlitchText({ text, className = "", as: Component = 'span', delay = 0 }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 70); // Typer speed: 70ms per char

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return (
    <Component className={`inline-block ${className}`}>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} ml-1 text-[var(--accent-gold)]`}>_</span>
    </Component>
  );
}
