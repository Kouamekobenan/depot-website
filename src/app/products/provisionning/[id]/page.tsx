import ProvisioningClient from "../ProvisionningClient";
export const dynamic = "auto";
// (optionnel) si tu veux générer les params statiques
export async function generateStaticParams() {
  return [];
}
export default async function ProvisioningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProvisioningClient productId={id} />;
}
