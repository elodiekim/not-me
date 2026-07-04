/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins_400Regular'],
        'sans-medium': ['Poppins_500Medium'],
        'sans-semibold': ['Poppins_600SemiBold'],
        'sans-bold': ['Poppins_700Bold'],
      },
      colors: {
        primary: '#FFB400',
        background: '#FFFFFF',
        surface: '#F8F8F8',
        'text-primary': '#111111',
        'text-secondary': '#666666',
        'text-disabled': '#AAAAAA',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        button: '999px',
        card: '24px',
        input: '16px',
        sheet: '28px',
      },
    },
  },
  plugins: [],
};
