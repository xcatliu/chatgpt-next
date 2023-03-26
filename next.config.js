/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用严格模式，否则在 dev 环境下 useEffect 会触发两次
  reactStrictMode: false,
  compress: false,
};

module.exports = nextConfig;
