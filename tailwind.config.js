/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': 'var(--bg-void)',
        'bg-midnight': 'var(--bg-midnight)',
        'bg-onyx': 'var(--bg-onyx)',
        'bg-carbon': 'var(--bg-carbon)', 
        'bg-graphite': 'var(--bg-graphite)',
        'accent-cyan': 'var(--accent-cyan)',
        'accent-gold': 'var(--accent-gold)',
        'f1-red': 'var(--f1-red)',
        'glass-border': 'var(--glass-border)',
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
      },
      boxShadow: {
        'glow-cyan': 'var(--shadow-glow-cyan)',
        'glow-gold': 'var(--shadow-glow-gold)',
        'glow-red': 'var(--shadow-glow-red)',
      }
    },
  },
  plugins: [],
}
