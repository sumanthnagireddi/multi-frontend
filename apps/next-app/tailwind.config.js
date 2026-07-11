/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    '../../libs/shared/react-ui/src/**/*.{ts,tsx,js,jsx}',
    '../../libs/shared/workspace-data/src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
