import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour les pages statiques
  trailingSlash: true,

  // Configuration pour les images
  images: {
    unoptimized: true,
  },

  // Configuration pour éviter les erreurs de hooks
  reactStrictMode: true,

  // Configuration pour le développement
  env: {
    CUSTOM_KEY: "my-value",
  },

  // Configuration pour autoriser les connexions réseau (FORMAT CORRECT)
  allowedDevOrigins: [
    "http://10.29.206.24:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Headers CORS pour le développement (CORRIGÉ)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Changé pour autoriser toutes les origines en dev
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
