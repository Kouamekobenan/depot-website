import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Head from "next/head";

export const metadata: Metadata = {
  title: "12Depôt",
  description: "Logiciel de gestion",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo12.png",
    apple: "/logo12.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="font-system antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
