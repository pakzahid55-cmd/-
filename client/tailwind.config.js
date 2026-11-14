/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kajok: {
          royal: '#6C3BCE',
          deep: '#32145F',
          accent: '#A78BFA',
          soft: '#EDE9FE',
          bg: '#F8F6FC',
          text: '#191523',
          muted: '#6B6680',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Inter', 'system-ui', 'sans-serif'],
        latin: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 14px rgba(50, 20, 95, 0.08)',
        lift: '0 10px 30px rgba(50, 20, 95, 0.16)',
      },
      borderRadius: { card: '14px' },
    },
  },
  plugins: [],
};
