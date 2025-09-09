"use client";
import { useAuth } from "@/app/context/AuthContext";
import api, { formatDate } from "@/app/prisma/api";
import { handleBack } from "@/app/types/handleApi";
import { directSaleDto } from "@/app/types/type";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FunnelIcon,
  Search,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export const Sale = () => {
  const [allDirectSales, setAllDirectSales] = useState<directSaleDto[]>([]);
  const [filteredSales, setFilteredSales] = useState<directSaleDto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSale, setSelectedSale] = useState<directSaleDto | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const limit = 10;
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Calcul des données paginées
  const totalCount = filteredSales.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  // Fonction pour récupérer toutes les ventes (sans filtres backend)
  const fetchAllDirectSales = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError("");

    try {
      let allSales: directSaleDto[] = [];
      let page = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await api.get(`directeSale/paginate/tenant/${tenantId}`, {
          params: { page, limit: 50 }, // Récupérer par lots de 50
        });

        if (res.data?.data && Array.isArray(res.data.data)) {
          allSales = [...allSales, ...res.data.data];

          // Vérifier s'il y a encore des données
          hasMoreData =
            res.data.data.length === 100 && page * 100 < res.data.totalCount;
          page++;
        } else {
          hasMoreData = false;
        }
      }
      setAllDirectSales(allSales);
      setFilteredSales(allSales);
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des ventes:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAllDirectSales();
  }, [tenantId, fetchAllDirectSales]);

  // Fonction pour appliquer les filtres côté frontend

  const applyFilters = useCallback(() => {
    let filtered = [...allDirectSales];

    // Filtre par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((sale) => {
        const productsMatch = sale.saleItems.some((item) =>
          item.productName.toLowerCase().includes(searchLower)
        );
        const totalPriceMatch = sale.totalPrice.toString().includes(searchTerm);
        const amountPaidMatch = sale.amountPaid.toString().includes(searchTerm);
        return productsMatch || totalPriceMatch || amountPaidMatch;
      });
    }

    // Filtre par date
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt || "");
        return saleDate >= startDate;
      });
    }

    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((sale) => {
        const saleDate = new Date(sale.createdAt || "");
        return saleDate <= endDate;
      });
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => {
        const paymentStatus = getPaymentStatus(sale).status;
        return paymentStatus === statusFilter;
      });
    }

    setFilteredSales(filtered);
    setCurrentPage(1);
  }, [
    allDirectSales,
    searchTerm,
    dateFilter,
    statusFilter,
    setFilteredSales,
    setCurrentPage,
    // getPaymentStatus,
  ]);

  // Fonction de recherche/filtrage
  const handleSearch = () => {
    applyFilters();
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({ start: "", end: "" });
    setStatusFilter("all");
    setFilteredSales(allDirectSales);
    setCurrentPage(1);
  };

  // Appliquer les filtres automatiquement quand les données changent
  useEffect(() => {
    applyFilters();
  }, [searchTerm, dateFilter, statusFilter, allDirectSales, applyFilters]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fonction pour formater la devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  // Fonction pour déterminer le statut de paiement
  const getPaymentStatus = (sale: directSaleDto) => {
    if (sale.amountPaid >= sale.totalPrice) {
      return { status: "payé", color: "bg-green-100 text-green-800" };
    } else if (sale.amountPaid > 0) {
      return { status: "partiel", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "impayé", color: "bg-red-100 text-red-800" };
    }
  };

  // Pagination component
  const Pagination = () => {
    const getVisiblePages = () => {
      const delta = window.innerWidth < 640 ? 1 : 2; // Moins de pages visibles sur mobile
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-3 sm:px-6">
        {/* Version mobile simplifiée */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>

          {/* Affichage page actuelle sur mobile */}
          <div className="flex items-center px-2">
            <span className="text-xs text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
          </div>

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>

        {/* Version desktop */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de{" "}
              <span className="font-medium">
                {totalCount === 0 ? 0 : startIndex + 1}
              </span>{" "}
              à{" "}
              <span className="font-medium">
                {Math.min(endIndex, totalCount)}
              </span>{" "}
              sur <span className="font-medium">{totalCount}</span> résultats
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              {getVisiblePages().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page as number)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === page
                          ? "z-10 bg-orange-600 text-white focus-visible:outline-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Modal pour les détails de la vente - Version responsive
  const SaleDetailModal = () => {
    if (!showModal || !selectedSale) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
        <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white min-h-[80vh] sm:min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Détails vente #{selectedSale.id}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="sr-only">Fermer</span>
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Grid responsive pour les infos principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Date de vente
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {formatDate(selectedSale.createdAt || "")}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Statut</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getPaymentStatus(selectedSale).color
                  }`}
                >
                  {getPaymentStatus(selectedSale).status}
                </span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Montant total
                </p>
                <p className="font-medium text-base sm:text-lg">
                  {formatCurrency(selectedSale.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Montant payé</p>
                <p className="font-medium text-base sm:text-lg text-green-600">
                  {formatCurrency(selectedSale.amountPaid)}
                </p>
              </div>
            </div>

            {selectedSale.dueAmount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-xs sm:text-sm text-red-600">
                  Reste à payer:{" "}
                  <span className="font-semibold">
                    {formatCurrency(selectedSale.dueAmount)}
                  </span>
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm sm:text-md font-medium text-gray-900 mb-2">
                Articles vendus
              </h4>

              {/* Version mobile : cartes */}
              <div className="block sm:hidden space-y-2">
                {selectedSale.saleItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm text-gray-900 flex-1">
                        {item.productName}
                      </h5>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="block text-gray-500">Qté:</span>
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Prix unit.:</span>
                        <span className="font-medium">
                          {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Total:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version desktop : tableau */}
              <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Produit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Qté
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Prix unit.
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedSale.saleItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* En-tête responsive */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Historique des Ventes
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700">
                Consultez et gérez l&apos;historique de toutes vos ventes
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleBack}
                className="w-full sm:w-auto bg-gray-700 text-white px-4 py-2 cursor-pointer hover:bg-gray-800 rounded-md text-sm"
              >
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche responsive */}
        <div className="bg-white shadow rounded-lg mb-4 sm:mb-6">
          <div className="p-3 sm:p-6">
            <div className="space-y-4">
              {/* Recherche */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="block w-full pl-8 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Rechercher par produit, montant..."
                  />
                </div>
              </div>

              {/* Filtres sur une ligne pour mobile, grid pour desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Filtre par statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="payé">Payé</option>
                    <option value="partiel">Partiel</option>
                    <option value="impayé">Impayé</option>
                  </select>
                </div>

                {/* Filtre par date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date début
                  </label>
                  <input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Appliquer les filtres
                </button>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur et de chargement */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-orange-700 px-3 sm:px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-xs sm:text-sm text-gray-500">
                Chargement en cours...
              </p>
            </div>
          ) : paginatedSales.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <svg
                className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune vente trouvée
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Aucune vente ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <>
              {/* Version mobile : cartes */}
              <div className="block sm:hidden divide-y divide-gray-200">
                {paginatedSales.map((sale) => {
                  const paymentStatus = getPaymentStatus(sale);
                  return (
                    <div key={sale.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(sale.createdAt || "")}
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatus.color}`}
                            >
                              {paymentStatus.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center text-sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Voir
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 block">Total:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(sale.totalPrice)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Payé:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(sale.amountPaid)}
                          </span>
                        </div>
                      </div>

                      {sale.dueAmount > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-xs">Reste:</span>
                          <span className="font-medium text-red-600 text-xs ml-1">
                            {formatCurrency(sale.dueAmount)}
                          </span>
                        </div>
                      )}

                      <div className="mt-2">
                        <div className="text-xs text-gray-600">
                          {sale.saleItems.slice(0, 2).map((item) => (
                            <div key={item.id}>
                              {item.productName} (x{item.quantity})
                            </div>
                          ))}
                          {sale.saleItems.length > 2 && (
                            <div className="text-gray-500">
                              +{sale.saleItems.length - 2} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Version desktop : tableau */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articles
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payé
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reste
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedSales.map((sale) => {
                      const paymentStatus = getPaymentStatus(sale);
                      return (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(sale.createdAt || "")}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                            <div className="flex flex-col">
                              {sale.saleItems.slice(0, 2).map((item) => (
                                <span key={item.id} className="text-xs">
                                  {item.productName} (x{item.quantity})
                                </span>
                              ))}
                              {sale.saleItems.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{sale.saleItems.length - 2} autres...
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(sale.totalPrice)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatCurrency(sale.amountPaid)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {sale.dueAmount > 0
                              ? formatCurrency(sale.dueAmount)
                              : "-"}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatus.color}`}
                            >
                              {paymentStatus.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowModal(true);
                              }}
                              className="text-blue-600 cursor-pointer hover:text-blue-900 inline-flex items-center"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Voir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedSales.length > 0 && <Pagination />}

        {/* Modal des détails */}
        <SaleDetailModal />
      </div>
    </div>
  );
};
