/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft pastel colors for kids
        pastel: {
          pink: '#FFB3D9',
          blue: '#B3D9FF',
          green: '#B3FFB3',
          yellow: '#FFFACD',
          purple: '#E6B3FF',
          peach: '#FFCAB3',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'bounce-star': 'bounce-star 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      keyframes: {
        'glow': {
          '0%, 100%': { textShadow: '0 0 5px rgba(255, 200, 0, 0)', filter: 'drop-shadow(0 0 2px rgba(255, 200, 0, 0))' },
          '50%': { textShadow: '0 0 20px rgba(255, 200, 0, 0.8)', filter: 'drop-shadow(0 0 10px rgba(255, 200, 0, 0.8))' },
        },
        'bounce-star': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 15px 50px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '30px',
      },
    },
  },
  plugins: [],
}
