/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: '#0A0B0D',
          surface: '#131519',
          elevated: '#1A1D24',
        },
        border: {
          muted: '#22252B',
          active: '#E8B23D',
        },
        accent: {
          gold: '#E8B23D',
          goldMuted: 'rgba(232, 178, 61, 0.1)',
        },
        signal: {
          rumor: '#E5484D',
          nonRumor: '#3DD68C',
          unverified: '#E8B23D',
          rumorMuted: 'rgba(229, 72, 77, 0.1)',
          nonRumorMuted: 'rgba(61, 214, 140, 0.1)',
          unverifiedMuted: 'rgba(232, 178, 61, 0.1)',
        },
        text: {
          primary: '#ECEDEE',
          secondary: '#8E939E',
          muted: '#5A5E67',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
