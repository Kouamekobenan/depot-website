import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRUCIAL : Configuration pour Electron - génère des fichiers statiques
  // output: "export",
  distDir: "../dist/renderer",
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
};

export default nextConfig;
