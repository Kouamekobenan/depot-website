// app/invoice/[id]/page.tsx (Server Component)
import { Suspense } from "react";
import { Metadata } from "next";
import InvoiceClient from "./PerformantClient";

// Configuration pour Next.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Génération des paramètres statiques
export async function generateStaticParams() {
  return [];
}

// Métadonnées pour la page
export const metadata: Metadata = {
  title: "Facture - Système de Commandes",
  description: "Facture détaillée de commande avec TVA",
};

// Composant de chargement
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page principale (Server Component)
export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params pour Next.js 15+
  // const resolvedParams = await params;
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InvoiceClient orderId={id} />
    </Suspense>
  );
}
