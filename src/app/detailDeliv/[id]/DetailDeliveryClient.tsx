// renderer/app/detailDeliv/[id]/DetailDeliveryClient.tsx
"use client";
import { Button } from "@/app/components/forms/Button";
import Navbar from "@/app/components/navbar/Navbar";
import api, { formatDate } from "@/app/prisma/api";
import { deliveryDto } from "@/app/types/type";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface DetailDeliveryClientProps {
  deliveryId: string;
}

export default function DetailDeliveryClient({
  deliveryId,
}: DetailDeliveryClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<deliveryDto | null>(null);
  const router = useRouter();

  const handleCanceledDeliv = async (delivery_id: string) => {
    try {
      await api.patch(`/delivery/canceled/${delivery_id}`);
      toast.success("Cette livraison en cours à été annulé");
      router.push("/deliveries");
    } catch (err) {
      setError("Erreur lors du chargement des détails de la livraison");
      console.error("Error fetching delivery:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDelivery = async (deliveryId: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/delivery/deliverie/${deliveryId}`);
        setDelivery(response.data.data);
      } catch (err) {
        setError("Erreur lors du chargement des détails de la livraison");
        console.error("Error fetching delivery:", err);
      } finally {
        setLoading(false);
      }
    };
    if (deliveryId) {
      fetchDelivery(deliveryId);
    }
  }, [deliveryId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "En attente";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminée";
      case "CANCELED":
        return "Annulée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="">
          <Navbar />
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="">
          <Navbar />
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="">
          <Navbar />
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-500">Aucune livraison trouvée</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="">
        <Navbar />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-5">
          <div className="flex items-center ">
            <Link href="/deliveries">
              <button className="mr-4 p-2 bg-gray-200  hover:bg-gray-300 rounded-lg transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            </Link>
            <div className="">
              <h1 className="text-3xl font-bold text-gray-900">
                Détails de la livraison
              </h1>
              <p className="text-gray-600 mt-2">ID: {delivery.id}</p>
            </div>
          </div>
          {delivery.status === "IN_PROGRESS" && (
            <div className="flex ">
              <Button
                onClick={() => handleCanceledDeliv(deliveryId)}
                label="Annulé la livraison en cours"
                className="text-xl bg-orange-600 text-white hover:bg-orange-500 border-0"
              />
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Informations de livraison
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      delivery.status
                    )}`}
                  >
                    {getStatusText(delivery.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date de création
                  </label>
                  <p className="text-gray-900">
                    {formatDate(delivery.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Livreur
                  </label>
                  <p className="text-gray-900">
                    {delivery.deliveryPerson?.name || "Non assigné"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prix total
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {delivery.totalPrice || "0.00"} Fcfa
                  </p>
                </div>
              </div>
            </div>
            {/* Products List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  Produits de la livraison
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livré
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retourné
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sous-total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {delivery.deliveryProducts?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || "Produit non défini"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.product?.price}
                          Fcfa
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-600 font-medium">
                            {item.deliveredQuantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-red-600 font-medium">
                            {item.returnedQuantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(
                            (item.product?.price || 0) * (item.quantity || 0)
                          ).toFixed(2)}{" "}
                          Fcfa
                        </td>
                      </tr>
                    )) || []}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Delivery Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Résumé de la livraison
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de produits:</span>
                  <span className="font-medium">
                    {delivery.deliveryProducts?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité totale:</span>
                  <span className="font-medium">
                    {delivery.deliveryProducts?.reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité livrée:</span>
                  <span className="font-medium text-green-600">
                    {delivery.deliveryProducts?.reduce(
                      (sum, item) => sum + Number(item.deliveredQuantity || 0),
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité retournée:</span>
                  <span className="font-medium text-red-600">
                    {delivery.deliveryProducts?.reduce(
                      (sum, item) => sum + Number(item.returnedQuantity || 0),
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {delivery.totalPrice?.toFixed(2) || "0.00"} Fcfa
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Modifier la livraison
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Imprimer le récapitulatif
                </button>
                {delivery.status === "PENDING" && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                    Marquer comme en cours
                  </button>
                )}
                {delivery.status === "IN_PROGRESS" && (
                  <Link href={`/validateLivery/${deliveryId}`}>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Marquer comme terminée
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
