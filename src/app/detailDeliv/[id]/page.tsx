// renderer/app/detailDeliv/[id]/page.tsx
import DetailDeliveryClient from "./DetailDeliveryClient";

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailDeliveryPage({ params }: PageProps) {
  const { id } = await params; // ✅ on "résout" la Promise
  return <DetailDeliveryClient deliveryId={id} />;
}
