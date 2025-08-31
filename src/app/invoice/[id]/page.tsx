// app/delivery/[id]/invoice/page.tsx
import { deliveryDto } from "@/app/types/type";
import { notFound } from "next/navigation";
import DeliveryInvoiceClient from "../DeliveryInvoiceClient";
import api from "@/app/prisma/api";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function generateStaticParams() {
  return [];
}
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getDeliveryData(
  deliveryId: string
): Promise<deliveryDto | null> {
  try {
    const res = await api.get(`/delivery/deliverie/${deliveryId}`);
    return res.data?.data as deliveryDto;
  } catch (error) {
    console.error("❌ Error fetching delivery:", error);
    return null;
  }
}

export default async function DeliveryInvoicePage({ params }: PageProps) {
  const { id } = await params; // ✅ on attend la Promise
  const delivery = await getDeliveryData(id);

  if (!delivery) {
    notFound();
  }

  return <DeliveryInvoiceClient delivery={delivery} />;
}
