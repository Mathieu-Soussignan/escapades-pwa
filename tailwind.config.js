/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ios: {
          bg: '#000000',
          card: 'rgba(28, 28, 30, 0.75)',
          cardLight: 'rgba(255, 255, 255, 0.85)',
          blue: '#0A84FF',
          green: '#30D158',
          orange: '#FF9F0A',
          purple: '#BF5AF2',
          pink: '#FF375F',
          indigo: '#5E5CE6',
          teal: '#64D2FF',
          subtext: '#8E8E93',
          border: 'rgba(255, 255, 255, 0.12)',
          borderLight: 'rgba(0, 0, 0, 0.08)'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        'ios-card': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
        'ios-glow': '0 0 20px rgba(10, 132, 255, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
