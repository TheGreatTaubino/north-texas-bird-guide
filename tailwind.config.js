/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        'bird-green': '#2d6a4f',
        'bird-blue': '#1b4965',
        'bird-amber': '#a8763e',
        'bird-navy': '#0d1b2a',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
