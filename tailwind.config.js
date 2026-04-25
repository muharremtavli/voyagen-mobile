/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        voyagen: {
          bg: '#0A0E1A',
          card: '#111827',
          surface: '#1F2937',
          border: '#374151',
          primary: '#06B6D4',
          secondary: '#10B981',
          accent: '#8B5CF6',
          text: '#F9FAFB',
          muted: '#9CA3AF',
          danger: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
