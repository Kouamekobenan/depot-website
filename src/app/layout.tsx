import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "12Depôt",
  description: "Logiciel de gestion",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="font-system antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
