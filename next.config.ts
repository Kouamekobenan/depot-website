/** @type {import('next').NextConfig} */
const nextConfig = {
  // Retirer cette ligne si elle pose problème avec les routes dynamiques
  // output: 'export',

  // Configuration pour les routes dynamiques
  experimental: {
    // Activer si nécessaire
    // appDir: true,
  },

  // Configuration pour les pages statiques
  trailingSlash: true,

  // Configuration pour les images (si vous en utilisez)
  images: {
    unoptimized: true, // Nécessaire si output: 'export' est activé
  },

  // Configuration pour éviter les erreurs de hooks
  reactStrictMode: true,

  // Configuration pour le développement
  env: {
    CUSTOM_KEY: "my-value",
  },
};

module.exports = nextConfig;
