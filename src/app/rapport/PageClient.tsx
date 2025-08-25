"use client";
import React, { useState, useEffect, useCallback } from "react";
import { deliveryDto } from "../types/type";
import api, { formatDate } from "../prisma/api";
import { useAuth } from "../context/AuthContext";

interface Statistics {
  totalDeliveries: number;
  completedDeliveries: number;
  totalProducts: number;
  totalDelivered: number;
  totalReturned: number;
  totalRevenue: number;
}

interface User {
  tenantId: string;
  // Ajoutez d'autres propriétés selon votre type User
}

interface AuthContextType {
  user: User | null;
}

export default function CreerRapport(): React.JSX.Element {
  const [startDate, setStartDate] = useState<string>("2025-07-01");
  const [endDate, setEndDate] = useState<string>("2025-07-22");
  const [deliveries, setDeliveries] = useState<deliveryDto[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<deliveryDto[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<Statistics>({
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalProducts: 0,
    totalDelivered: 0,
    totalReturned: 0,
    totalRevenue: 0,
  });

  const { user } = useAuth() as AuthContextType;
  const tenantId: string | undefined = user?.tenantId;

  const handleBack = (): void => {
    window.history.back();
  };

  // Fonction pour récupérer les livraisons
  const fetchDeliveries = async (): Promise<void> => {
    if (!tenantId) {
      console.error("TenantId manquant");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/delivery/tenant/${tenantId}`);
      console.log("Données api", response.data);

      const deliveriesData: deliveryDto[] = response.data;
      setDeliveries(deliveriesData);
      filterDeliveriesByDate(deliveriesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des livraisons:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les livraisons par date
  const filterDeliveriesByDate = useCallback(
    (deliveriesData: deliveryDto[]): void => {
      const filtered = deliveriesData.filter((delivery: deliveryDto) => {
        const deliveryDate = new Date(delivery.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Inclure toute la journée de fin

        return deliveryDate >= start && deliveryDate <= end;
      });

      setFilteredDeliveries(filtered);
      calculateStatistics(filtered);
    },
    [endDate, startDate]
  );

  // Calculer les statistiques
  const calculateStatistics = (deliveriesData: deliveryDto[]): void => {
    const stats: Statistics = {
      totalDeliveries: deliveriesData.length,
      completedDeliveries: deliveriesData.filter(
        (d: deliveryDto) => d.status === "COMPLETED"
      ).length,
      totalProducts: 0,
      totalDelivered: 0,
      totalReturned: 0,
      totalRevenue: 0,
    };

    deliveriesData.forEach((delivery: deliveryDto) => {
      delivery.deliveryProducts.forEach((dp) => {
        stats.totalProducts += parseInt(dp.quantity.toString());
        stats.totalDelivered += parseInt(dp.deliveredQuantity.toString());
        stats.totalReturned += parseInt(dp.returnedQuantity.toString());
        stats.totalRevenue +=
          parseInt(dp.deliveredQuantity.toString()) *
          parseInt(dp.product.price.toString());
      });
    });

    setStatistics(stats);
  };

  // Générer le rapport
  const handleGenerateReport = (): void => {
    fetchDeliveries();
  };

  // Format de date pour l'affichage

  // Format de prix
  const formatPrice = (price: string | number): string => {
    const priceNumber = typeof price === "string" ? parseInt(price) : price;
    return priceNumber.toLocaleString("fr-FR") + " FCFA";
  };

  // Exporter en CSV
  const exportToCSV = (): void => {
    const csvData: (string | number)[][] = [];
    csvData.push([
      "Date",
      "Livreur",
      "Statut",
      "Produit",
      "Quantité",
      "Livré",
      "Retourné",
      "Prix unitaire",
      "Total",
    ]);

    filteredDeliveries.forEach((delivery: deliveryDto) => {
      delivery.deliveryProducts.forEach((dp) => {
        csvData.push([
          formatDate(delivery.createdAt),
          delivery.deliveryPerson.name,
          delivery.status,
          dp.product.name,
          dp.quantity,
          dp.deliveredQuantity,
          dp.returnedQuantity,
          dp.product.price,
          Number(dp.deliveredQuantity) * Number(dp.product.price),
        ]);
      });
    });

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_livraisons_${startDate}_${endDate}.csv`; // Corrigé: .csv au lieu de .pdf
    a.click();
    window.URL.revokeObjectURL(url); // Nettoyage de l'URL
  };

  useEffect(() => {
    if (deliveries.length > 0) {
      filterDeliveriesByDate(deliveries);
    }
  }, [startDate, endDate, deliveries, filterDeliveriesByDate]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
      >
        Retour
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Rapport de Livraisons</h1>

        {/* Filtres de date */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-3">Période du rapport</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEndDate(e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-6 py-2 bg-green-600 cursor-pointer hover:bg-green-700 disabled:opacity-50 text-white rounded-md transition-colors"
              >
                {loading ? "Chargement..." : "Générer Rapport"}
              </button>
              {filteredDeliveries.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {filteredDeliveries.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-medium mb-3">Statistiques</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {statistics.totalDeliveries}
                </div>
                <div className="text-sm text-gray-300">Total Livraisons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {statistics.completedDeliveries}
                </div>
                <div className="text-sm text-gray-300">Complétées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {statistics.totalProducts}
                </div>
                <div className="text-sm text-gray-300">Produits Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {statistics.totalDelivered}
                </div>
                <div className="text-sm text-gray-300">Livrés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {statistics.totalReturned}
                </div>
                <div className="text-sm text-gray-300">Retournés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {formatPrice(statistics.totalRevenue)}
                </div>
                <div className="text-sm text-gray-300">
                  Chiffre d&apos;Affaires
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des livraisons */}
        {filteredDeliveries.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium">
                Détails des Livraisons ({filteredDeliveries.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Livreur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Produits
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredDeliveries.map((delivery: deliveryDto) => (
                    <tr key={delivery.id} className="hover:bg-gray-750">
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(delivery.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div>
                          <div className="font-medium">
                            {delivery.deliveryPerson.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            delivery.status === "COMPLETED"
                              ? "bg-green-900 text-green-200"
                              : "bg-yellow-900 text-yellow-200"
                          }`}
                        >
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {delivery.deliveryProducts.map((dp) => (
                            <div
                              key={dp.id}
                              className="bg-gray-700 p-3 rounded"
                            >
                              <div className="font-medium">
                                {dp.product.name}
                              </div>
                              <div className="text-sm text-gray-300 mt-1">
                                Quantité: {dp.quantity} | Livré:{" "}
                                {dp.deliveredQuantity} | Retourné:{" "}
                                {dp.returnedQuantity}
                              </div>
                              <div className="text-sm text-gray-300">
                                Prix: {formatPrice(dp.product.price)} | Total:{" "}
                                {formatPrice(
                                  Number(dp.deliveredQuantity) *
                                    Number(dp.product.price)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-gray-400 mb-2">
              Aucune livraison trouvée pour cette période
            </div>
            <div className="text-sm text-gray-500">
              Ajustez les dates ou cliquez sur `Générer Rapport` pour charger
              les données
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
