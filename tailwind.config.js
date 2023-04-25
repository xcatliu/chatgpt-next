const colors = require('tailwindcss/colors');

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
    screens: {
      // 1125 = 768 + 768 * (1 - 0.618) + 16 * 4
      // 对话框 + 菜单栏 + 间隔
      md: '1125px',
    },
    extend: {
      screens: {
        // https://tailwindcss.com/docs/screens#custom-media-queries
        // 1317 = 800 + 315 + 16 * 6 * 2
        tall: { raw: '(min-height: 1317px)' },
        // => @media (min-height: 1317px) { ... }
      },
      colors: {
        // 聊天气泡
        'chat-bubble': {
          DEFAULT: colors.white,
          dark: '#2c2c2c',
        },
        // 聊天气泡绿色
        'chat-bubble-green': {
          DEFAULT: '#abe987',
          dark: '#51b170',
        },
        // 聊天背景颜色
        'chat-bg': {
          DEFAULT: '#ededed',
          dark: '#111111',
        },
      },
    },
  },
  plugins: [],
};
