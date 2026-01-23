/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': '#0F1115',      // Asphalt Black
        'bg-midnight': '#16181C',  // Carbon Dark
        'bg-onyx': '#1c1c20',      // Deep Graphite
        'bg-carbon': '#232328',    // Lighter Carbon
        'bg-graphite': '#2a2a30',  // Surface Grey
        
        // Primary Accents
        'accent-cyan': '#00d4ff',
        'accent-gold': '#F5C242',  // Brand Gold
        'f1-red': '#FF1801',       // Race Red (High Vis)
        
        // Telemetry Colors (Data Status)
        'telemetry-purple': '#D103D1', // Fastest / Best
        'telemetry-green': '#00FF00',  // Personal Best
        'telemetry-yellow': '#FFE600', // Warning / Pending
        'telemetry-cyan': '#00E0FF',   // Live Data

        'glass-border': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Geist', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        titillium: ['Geist', 'var(--font-titillium)', 'system-ui', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'monospace'],
        mono: ['Geist Mono', 'var(--font-roboto-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-highlight': 'slideHighlight 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        slideHighlight: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-gold': '0 0 20px rgba(245, 194, 66, 0.4)',
        'glow-red': '0 0 20px rgba(255, 24, 1, 0.4)',
      }
    },
  },
  plugins: [],
}
