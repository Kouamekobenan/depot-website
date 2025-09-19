import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dossier de build personnalisé (attention avec Railway : le dist doit rester dans le repo)
  // distDir: "../dist/renderer",
  output: "export",

  // Génère des URL avec / à la fin
  trailingSlash: true,

  // Images non optimisées (utile avec Electron)
  images: {
    unoptimized: true,
  },

  // Mode strict React
  reactStrictMode: true,

  // Variables d’environnement (⚠ Railway injecte ses propres env vars, pas besoin de forcer ici)
  env: {
    CUSTOM_KEY: "my-value",
  },

  // ⚠ Retiré : experimental.esmExternals → deprecated
  // Tu n’as plus besoin de ça avec Next 15

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
