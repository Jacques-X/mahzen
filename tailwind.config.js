/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#FBF0FE',
          100: '#F7E1FD',
          200: '#EEDCFC',
          300: '#E0C0FB',
          400: '#D19FF9',
          500: '#C365F7', // The requested color
          600: '#A93CE3',
          700: '#8A26BD',
          800: '#6C1C96',
          900: '#4F126F',
          950: '#3A0B53',
        },
      },
    },
  },
  plugins: [],
}
