// app/print/[id]/page.tsx (Server Component)
import { Suspense } from "react";
import { Metadata } from "next";
import PrintSaleClient from "../PrintClientCoponnent";

// Configuration pour Next.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Génération des paramètres statiques - Retirer si vous utilisez "output: export"
export async function generateStaticParams() {
  // Retourner un tableau vide pour éviter l'erreur de génération statique
  return [];
}

// Métadonnées pour la page
export const metadata: Metadata = {
  title: "Imprimer Facture - Système de Vente",
  description: "Impression de facture de vente directe",
};

// Composant de chargement
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Page principale (Server Component)
export default async function PrintSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params pour Next.js 15+
  // const resolvedParams = await params;
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PrintSaleClient directeSaleId={id} />
    </Suspense>
  );
}
