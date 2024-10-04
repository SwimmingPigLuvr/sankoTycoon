/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'FinkHeavy': ['FinkHeavy-Regular', 'serif'],
        'TechnologyBold': ['Technology-Bold', 'serif'],
      },
    },
  },
  plugins: [],
}

