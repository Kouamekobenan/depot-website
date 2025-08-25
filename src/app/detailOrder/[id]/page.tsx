// app/order/[id]/page.tsx (Server Component)
import { Suspense } from "react";
import OrderDetailClient from "./OrderDetailClient";
import { Metadata } from "next";

// Configuration pour Next.js
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Génération des paramètres statiques
export async function generateStaticParams() {
  return [];
}

// Métadonnées pour la page
export const metadata: Metadata = {
  title: "Détails de la commande - Système de Gestion",
  description: "Détails complets de la commande avec analyse de rentabilité",
};

// Composant de chargement
function LoadingSpinner() {
  return (
    <div className="flex gap-4 min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    </div>
  );
}

// Page principale (Server Component)
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params pour Next.js 15+
  // const resolvedParams = await params;
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderDetailClient orderId={id} />
    </Suspense>
  );
}
