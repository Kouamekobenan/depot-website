import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  webpack: (config: WebpackConfig, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
