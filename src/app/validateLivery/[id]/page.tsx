import Navbar from "@/app/components/navbar/Navbar";
import ValidateDeliveryClient from "./ValidateClientComponent";

export const dynamic = "auto";

// (optionnel) si tu veux générer des params statiques
export async function generateStaticParams() {
  return [];
}

export default async function ValidateDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Navbar />
      <ValidateDeliveryClient deliveryId={id} />
    </div>
  );
}
