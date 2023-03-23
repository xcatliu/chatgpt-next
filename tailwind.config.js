/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
    screens: {
      // 768 + 768*(1-0.618) + 16*4 + 1 = 1126
      // 对话框 + 菜单栏 + 间隔 + 1px区分
      md: '1126px',
    },
  },
  plugins: [],
};
