/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (isProduction
        ? "https://api.smm-league.lovable.app"
        : "http://localhost:3001"),
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
