import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRUCIAL : Configuration pour Electron - génère des fichiers statiques
  // output: "export",

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

  // Désactiver certaines optimisations qui causent des problèmes avec les hooks
  experimental: {
    esmExternals: false, // Peut aider avec les erreurs de hooks
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Headers CORS pour le développement
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
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
