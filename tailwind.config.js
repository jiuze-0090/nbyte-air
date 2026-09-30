/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nbyte: {
          50: '#eef4ff',
          100: '#d9e4ff',
          200: '#b8ccff',
          300: '#8ba8ff',
          400: '#5b78f5',
          500: '#3a52e0',
          600: '#2838b8',
          700: '#1e2a8f',
          800: '#15206b',
          900: '#0c1645',
          950: '#060d2b',
        },
        accent: {
          orange: '#ff6b35',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
