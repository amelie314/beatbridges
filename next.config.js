/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "lh3.googleusercontent.com",
    ],
  },
  // 在這裡添加其他配置
};

module.exports = nextConfig;
