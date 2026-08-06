/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  corePlugins: { preflight: false }, // prevent Mantine style conflicts
  theme: {
    extend: {
      colors: {
        hub: {
          bg: '#0f172a',
          card: '#1e293b',
          'card-hover': '#263347',
          accent: '#8b5cf6',
          'accent-light': '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hub-card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'hub-card-hover': '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'hub-glow': '0 0 0 1px rgba(139,92,246,0.25), 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
