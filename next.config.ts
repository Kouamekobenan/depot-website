// import withPWA from "next-pwa";
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Génère des URL avec / à la fin
//   trailingSlash: true,

//   // Images non optimisées (utile avec Electron)
//   images: {
//     unoptimized: true,
//   },

//   // Mode strict React
//   reactStrictMode: true,

//   // Variables d’environnement (⚠ Railway injecte ses propres env vars)
//   env: {
//     CUSTOM_KEY: "my-value",
//   },

//   // ⚙️ Webpack personnalisé pour Electron (garde ton comportement actuel)
//   webpack: (config, { dev }) => {
//     if (dev) {
//       config.watchOptions = {
//         poll: 1000,
//         aggregateTimeout: 300,
//       };
//     }
//     return config;
//   },

//   // ⚙️ Optionnel (mais utile pour Next.js 14+ ou 15)
//   experimental: {
//     serverActions: true,
//   },
// };

// // 👇 Ajoute ici la configuration PWA (fusion)
// export default withPWA({
//   dest: "public", // où le service worker sera généré
//   register: true, // enregistrement automatique du SW
//   skipWaiting: true, // active immédiatement le nouveau SW
//   disable: process.env.NODE_ENV === "development", // désactive en dev
// })(nextConfig);

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
