import DeliveryStatsClient from "./PerformanceClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// (optionnel) si tu veux préparer des params statiques
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeliveryStatsPage({ params }: PageProps) {
  const { id } = await params; // ✅ on attend la Promise
  return <DeliveryStatsClient deliveryPersonId={id} />;
}
