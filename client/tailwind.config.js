/** @type {import('tailwindcss').Config} */

// rgb(var(--c-name) / alpha): see src/styles/tokens.css.
const tok = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== The one colour layer (Spec 0005 ticket 17) =====
        // Every class below reads a CSS variable from src/styles/tokens.css, the
        // single source of colour. A purchased theme writes those variables, so
        // anything drawn with these classes follows the theme. Use `pysim-*`;
        // the other families are aliases kept until the contract step.
        'pysim': {
          'primary': tok('primary'),
          'primary-container': tok('primary-container'),
          'primary-fixed': tok('primary-fixed'),
          'on-primary': tok('on-primary'),
          'on-primary-fixed': tok('on-primary-fixed'),
          'secondary': tok('secondary'),
          'secondary-container': tok('secondary-container'),
          'secondary-fixed': tok('secondary-fixed'),
          'on-secondary': tok('on-secondary'),
          'on-secondary-container': tok('on-secondary-container'),
          'tertiary': tok('tertiary'),
          'tertiary-container': tok('tertiary-container'),
          'tertiary-fixed': tok('tertiary-fixed'),
          'surface': tok('surface'),
          'surface-low': tok('surface-low'),
          'surface-container': tok('surface-container'),
          'surface-high': tok('surface-high'),
          'surface-highest': tok('surface-highest'),
          'surface-dim': tok('surface-dim'),
          'card': tok('card'),
          'on-surface': tok('on-surface'),
          'on-surface-variant': tok('on-surface-variant'),
          'outline': tok('outline'),
          'outline-variant': tok('outline-variant'),
          'label': tok('label'),
          'accent': tok('accent'),
          'accent-strong': tok('accent-strong'),
          'accent-container': tok('accent-container'),
          'accent-border': tok('accent-border'),
          'error': tok('error'),
          'error-container': tok('error-container'),
          'error-border': tok('error-border'),
          'success': tok('success'),
          'success-strong': tok('success-strong'),
          'success-container': tok('success-container'),
          'success-border': tok('success-border'),
          'warning': tok('warning'),
          'warning-strong': tok('warning-strong'),
          'warning-container': tok('warning-container'),
          'warning-border': tok('warning-border'),
          'info': tok('info'),
          'info-strong': tok('info-strong'),
          'info-container': tok('info-container'),
          'info-border': tok('info-border'),
          'inverse-surface': tok('inverse-surface'),
          'inverse-surface-high': tok('inverse-surface-high'),
          'inverse-outline': tok('inverse-outline'),
          'on-inverse': tok('on-inverse'),
          'on-inverse-muted': tok('on-inverse-muted'),
          'inverse-code': tok('inverse-code'),
          'inverse-accent': tok('inverse-accent'),
          'inverse-success': tok('inverse-success'),
        },
        // ===== Deprecated aliases (expand-contract, do not use in new code) =====
        // Old theme-aware family. Pointed at the token layer; was var(--t-*).
        't': {
          'bg': tok('surface'),
          'bg-soft': tok('surface-low'),
          'card': tok('card'),
          'card-hover': tok('surface-low'),
          'input': tok('card'),
          'text': tok('on-surface'),
          'text-soft': tok('on-surface-variant'),
          'muted': tok('outline'),
          'accent': tok('primary'),
          'accent-soft': tok('primary-fixed'),
          'accent-hover': tok('primary'),
          'accent-2': tok('tertiary'),
          'border': tok('outline-variant'),
          'border-accent': tok('primary-container'),
          'glow': tok('primary'),
          'glass': tok('card'),
          'glass-border': tok('outline-variant'),
          'window-bg': tok('card'),
          'window-titlebar': tok('surface-low'),
          'danger': tok('error'),
          'danger-soft': tok('error-container'),
          'success': tok('success'),
          'success-soft': tok('success-container'),
          'overlay': tok('on-surface'),
          'icon-bg': tok('surface-container'),
          'icon-bg-hover': tok('surface-high'),
          'icon-border': tok('outline-variant'),
        },
        // Old fixed accents. No class used them when they were pointed here.
        'cyber': {
          'blue': tok('info'),
          'green': tok('success'),
          'purple': tok('info'),
          'dark': tok('on-surface'),
          'darker': tok('on-surface'),
        },
        'neon': {
          'pink': tok('accent'),
          'orange': tok('warning'),
          'yellow': tok('secondary-container'),
        },
        'cat': {
          'orange': tok('warning'),
          'amber': tok('warning'),
          'light': tok('warning-border'),
          'dark': tok('warning-strong'),
        },
        // Friend's learning app tokens; --color-* in index.css alias the layer.
        'bg-primary': tok('card'),
        'bg-secondary': tok('surface'),
        'text-primary': tok('on-surface'),
        'text-secondary': tok('outline'),
        'accent': tok('secondary-container'),
        'primary': tok('primary'),
      },
      fontSize: {
        // The smallest a label may be (audit: 8-10px labels). text-label-min in tokens.css.
        'label': ['var(--text-label-min)', { lineHeight: '1rem' }],
      },
      minHeight: {
        'target': 'var(--target-min)',
        'target-primary': 'var(--target-primary)',
      },
      minWidth: {
        'target': 'var(--target-min)',
        'target-primary': 'var(--target-primary)',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 3px)' },
          '40%': { transform: 'translate(-3px, -3px)' },
          '60%': { transform: 'translate(3px, 3px)' },
          '80%': { transform: 'translate(3px, -3px)' },
          '100%': { transform: 'translate(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--t-glow), 0 0 10px var(--t-glow)' },
          '50%': { boxShadow: '0 0 20px var(--t-glow), 0 0 40px var(--t-glow)' },
        },
        neonPulse: {
          '0%, 100%': { textShadow: '0 0 5px var(--t-accent), 0 0 10px var(--t-accent)' },
          '50%': { textShadow: '0 0 20px var(--t-accent), 0 0 40px var(--t-accent)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        catTail: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        catBlink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        progressBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        slideMenu: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-10deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'cat-tail': 'catTail 1.5s ease-in-out infinite',
        'cat-blink': 'catBlink 4s ease-in-out infinite',
        'progress': 'progressBar 3s ease-out forwards',
        'slide-menu': 'slideMenu 0.25s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'rotate-in': 'rotateIn 0.4s ease-out',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      backgroundSize: {
        '300%': '300% 300%',
      },
    },
  },
  plugins: [],
}