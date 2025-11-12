import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "12Depôt",
  description: "Logiciel de gestion",
  themeColor: "#000000", // 👈 directement ici
  manifest: "/manifest.json", // 👈 tu peux le mettre ici aussi
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="font-system antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
