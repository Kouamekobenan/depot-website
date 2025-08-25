"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../forms/Button";
import { deliveryDto } from "@/app/types/type";
import api, { formatDate } from "@/app/prisma/api";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

const limit = 5;

interface DeliveryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

interface DeliveryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  canceled: number;
}
const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  CANCELED: "Annulée",
  COMPLETED: "Livrée",
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function DeliveryList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deliveries, setDeliveries] = useState<deliveryDto[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0,
  });
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  // Fonction pour calculer les statistiques
  const calculateStats = useCallback(async () => {
    try {
      const response = await api.get("/delivery/stats");
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      // Calculer les stats localement si l'API ne fournit pas d'endpoint
      const localStats: DeliveryStats = {
        total: totalOrders,
        pending: 0,
        inProgress: 0,
        completed: 0,
        canceled: 0,
      };

      deliveries.forEach((delivery) => {
        switch (delivery.status.toLowerCase()) {
          case "pending":
          case "en attente":
            localStats.pending++;
            break;
          case "in_progress":
          case "en cours":
            localStats.inProgress++;
            break;
          case "completed":
          case "livré":
            localStats.completed++;
            break;
          case "canceled":
          case "annulé":
            localStats.canceled++;
            break;
        }
      });

      setStats(localStats);
    }
  }, [totalOrders, deliveries]);

  const fetchDelivery = useCallback(
    async (page: number = 1, search: string = "", status: string = "ALL") => {
      try {
        setLoading(true);
        const params: DeliveryParams = {
          page,
          limit,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status !== "ALL") {
          params.status = status;
        }

        console.log("Paramètres de recherche:", params);
        const response = await api.get(`/delivery/paginate/${tenantId}`, {
          params,
        });
        console.log("Réponse API:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          setDeliveries(response.data.data);
          setTotalPages(response.data.totalPage);
          setTotalOrders(response.data.total || 0);
          setCurrentPage(page);
          setError(null);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des commandes:", error);

        const apiError = error as ApiError;
        setError(
          apiError.response?.data?.message ||
            apiError.message ||
            "Erreur lors du chargement des commandes"
        );
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );
  // Gestionnaire de recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchDelivery(1, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, fetchDelivery]);

  // Calculer les stats après chaque fetch
  useEffect(() => {
    if (deliveries.length > 0) {
      calculateStats();
    }
  }, [deliveries, calculateStats]);

  // Gestionnaire de changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDelivery(page, searchTerm, statusFilter);
  };
  // Gestionnaire de navigation précédent/suivant
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };
  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "livré":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "en attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
      case "en cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "canceled":
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // Fonction pour vérifier si les boutons doivent être affichés
  const canShowActionButtons = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    return (
      normalizedStatus === "pending" ||
      normalizedStatus === "en attente" ||
      normalizedStatus === "in_progress" ||
      normalizedStatus === "en cours"
    );
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestion des Livraisons
          </h1>
          <p className="text-gray-600">
            Total: {totalOrders} livraison{totalOrders > 1 ? "s" : ""}
          </p>
        </div>
        <div className="">
          <Link href="/deliveryform">
            <Button
              label="Créer une livraison"
              className="bg-orange-600 font-sans hover:bg-orange-700 border-0 text-white"
            />
          </Link>
        </div>
      </div>
      {/* Dashboard des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Annulé</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.total}
                {deliveries.filter((o) => o.status == "CANCELED").length}
              </p>
            </div>
            <div className="bg-orange-300 rounded-full p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
                {deliveries.filter((o) => o.status == "PENDING").length}
              </p>
            </div>
            <div className="bg-orange-300 rounded-full p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.inProgress}
                {deliveries.filter((o) => o.status == "IN_PROGRESS").length}
              </p>
            </div>
            <div className="bg-orange-300 rounded-full p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Livrées</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.completed}
                {deliveries.filter((o) => o.status == "COMPLETED").length}
              </p>
            </div>
            <div className="bg-orange-300 rounded-full p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Rechercher
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Rechercher par ID, livreur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          {/* Filtre par statut */}
          <div className="md:w-64">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Statut
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Livré</option>
              <option value="CANCELED">Annulé</option>
            </select>
          </div>
        </div>
      </div>
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Liste des livraisons */}
      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L8 9l4-4 4 4z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Aucune livraison trouvée</p>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      ID: {delivery.id.slice(-10)}...
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {statusLabels[delivery.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-gray-600">Livreur:</span>
                      <span className="font-medium">
                        {delivery.deliveryPerson.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m0 0V7a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h0"
                        />
                      </svg>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formatDate(delivery.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-serif text-gray-600">
                      Montant prévu
                    </p>
                    <p className="text-md font-bold text-green-600 text-justify">
                      {delivery.totalPrice}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/detailDeliv/${delivery.id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors duration-200">
                        <Eye /> Details
                      </button>
                    </Link>

                    <Link href={`/invoice/${delivery.id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors duration-200">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                        Imprimer
                      </button>
                    </Link>
                    {canShowActionButtons(delivery.status) && (
                      <>
                        <Link href={`/validateLivery/${delivery.id}`}>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border-0 rounded-md transition-colors duration-200">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Suivi
                          </button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border-0 rounded-md hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Précédent
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border-0 rounded-md hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Suivant
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * limit + 1} à{" "}
            {Math.min(currentPage * limit, totalOrders)} sur {totalOrders}
          </div>
        </div>
      )}
      {/* Indicateur de chargement */}
      {loading && deliveries.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      )}
    </div>
  );
}
