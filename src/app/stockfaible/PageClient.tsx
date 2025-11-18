"use client";
import React, { useCallback, useEffect, useState } from "react";
// Assurez-vous que le chemin vers Navbar est correct
import Navbar from "../components/navbar/Navbar";
// Assurez-vous que le chemin vers productItems est correct
import { productItems } from "../types/type";
import api from "../prisma/api"; // Assurez-vous que le chemin vers votre API est correct
import { useAuth } from "../context/AuthContext"; // Assurez-vous que le chemin vers AuthContext est correct

// Interface pour les données de pagination
interface PaginationData {
  data: productItems[];
  total: number;
  totalPage: number;
  page: number;
}

export default function LowStockProductsPage() {
  const [products, setProducts] = useState<productItems[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Déplacé ici pour des raisons de clarté, mais vos constantes étaient bien placées
  const limit = 10;
  const stockThreshold = 10;

  // Fonction pour récupérer les produits avec stock faible (Optimisé pour inclure 'limit' comme dépendance stable)
  const fetchLowStockProducts = useCallback(
    async (pageNumber: number = 1): Promise<void> => {
      if (!tenantId) {
        setError("ID tenant manquant");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/product/lower/${tenantId}`, {
          params: {
            limit,
            page: pageNumber,
          },
        });

        const productData: PaginationData = response.data;

        if (Array.isArray(productData.data)) {
          setProducts(productData.data);
          setTotalPages(productData.totalPage || 1);
          setPage(productData.page || pageNumber);
          setTotal(productData.total || 0);
        } else {
          throw new Error("Format de données invalide");
        }
      } catch (error: unknown) {
        const errorMessage: string =
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des produits";

        console.error(
          "Échec de récupération des produits avec stock critique:",
          error
        );
        setError(`Impossible de charger les produits: ${errorMessage}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId] // 'limit' est une constante, pas besoin de l'inclure si elle ne change pas
  );

  // Chargement initial
  useEffect(() => {
    if (tenantId) {
      fetchLowStockProducts(1);
    }
  }, [tenantId, fetchLowStockProducts]);

  // Fonction pour changer de page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      fetchLowStockProducts(newPage);
    }
  };

  // Fonction pour déterminer le niveau d'alerte du stock
  const getStockAlertLevel = (stock: number) => {
    if (stock === 0) return "critical";
    if (stock <= 3) return "high";
    if (stock <= 6) return "medium";
    return "low";
  };

  // Fonction pour formatter le prix
  const formatPrice = (price: number): string => {
    // Utilise le code de devise standard (XOF/XAF pour "F") ou ajustez selon votre besoin
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF", // Exemple de devise Ouest Africaine. Remplacez par votre devise si différente.
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Composant d'alerte de stock amélioré
  const StockAlert = ({ stock }: { stock: number }) => {
    const alertLevel = getStockAlertLevel(stock);
    const alertConfig = {
      critical: {
        color: "bg-red-100 text-red-800 border border-red-300",
        dot: "bg-red-500",
        text: "Rupture",
        priority: "URGENT",
      },
      high: {
        color: "bg-orange-100 text-orange-800 border border-orange-300",
        dot: "bg-orange-500",
        text: "Critique",
        priority: "ÉLEVÉ",
      },
      medium: {
        color: "bg-amber-100 text-amber-800 border border-amber-300",
        dot: "bg-amber-500",
        text: "Faible",
        priority: "MOYEN",
      },
      low: {
        color: "bg-blue-100 text-blue-800 border border-blue-300",
        dot: "bg-blue-500",
        text: "Limité",
        priority: "BAS",
      },
    };

    const config = alertConfig[alertLevel];

    return (
      <div className="space-y-1">
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}
        >
          <div className={`w-2 h-2 rounded-full mr-1.5 ${config.dot}`}></div>
          {stock === 0 ? config.text : `${stock} unités`}
        </div>
        <div
          className={`text-xs font-medium opacity-80 ${
            alertLevel === "critical"
              ? "text-red-600"
              : alertLevel === "high"
              ? "text-orange-600"
              : alertLevel === "medium"
              ? "text-amber-600"
              : "text-blue-600"
          } hidden sm:block`}
        >
          Priorité: {config.priority}
        </div>
      </div>
    );
  };

  // Composant de pagination amélioré
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);

        if (page > 3) {
          pages.push("...");
        }

        // Pages centrales
        for (
          let i = Math.max(2, page - 1);
          i <= Math.min(totalPages - 1, page + 1);
          i++
        ) {
          pages.push(i);
        }

        if (page < totalPages - 2) {
          pages.push("...");
        }

        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }
      // On retire les doublons de points si l'intervalle est trop petit
      return pages.filter(
        (item, index, self) =>
          !(item === "..." && self[index - 1] === "...") &&
          !(item === self[index - 1] && typeof item === "number")
      );
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-white border-t border-gray-100 space-y-3 sm:space-y-0">
        <div className="flex items-center text-sm text-gray-700 order-2 sm:order-1">
          <span className="font-medium">
            {Math.min((page - 1) * limit + 1, total)} -{" "}
            {Math.min(page * limit, total)}
          </span>
          <span className="mx-2 text-gray-500">sur</span>
          <span className="font-medium">{total}</span>
          <span className="ml-2 text-gray-500">résultats</span>
        </div>

        <div className="flex items-center space-x-1 order-1 sm:order-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">‹</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1">
            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof pageNum === "number"
                    ? handlePageChange(pageNum)
                    : undefined
                }
                disabled={loading || pageNum === "..."}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pageNum === page
                    ? "bg-blue-600 text-white border border-blue-600 shadow-md"
                    : pageNum === "..."
                    ? "text-gray-500 cursor-default px-1" // Plus compact pour les points de suspension
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <div className="sm:hidden flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {page}/{totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || loading}
            className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">›</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Navigation (Fixé sur grands écrans) */}
        <div className="hidden lg:block fixed left-0 top-0 h-full z-20">
          <Navbar />
        </div>
        <div className="lg:hidden z-20">
          <Navbar />
        </div>
        {/* Main Content (Ajout de max-w-7xl et mx-auto pour centrer sur très grands écrans) */}
        <div className="flex-1 lg:ml-72">
          {/* Header Section (Ajout de sticky pour le garder visible lors du défilement) */}
          <div className="bg-white shadow-md sticky top-0 z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
              {/* Max-width et centrage */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Titre et description */}
                <div className="flex items-center space-x-3 sm:space-x-4 pt-12 lg:pt-0">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-xl">
                    {" "}
                    {/* Changé couleur pour correspondre à l'alerte */}
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900">
                      ⚠️ Stock Critiques
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                      Produits avec stock **inférieur à {stockThreshold}{" "}
                      unités**. Action requise.
                    </p>
                  </div>
                </div>

                {/* Statistique et Bouton d'Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-700">
                        {total}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-red-600">
                        Produits en alerte
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchLowStockProducts(page)}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                  >
                    <svg
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {loading ? "Actualisation..." : "Actualiser"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Content Section */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-300 rounded-xl p-4 sm:p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-red-900 font-bold text-sm sm:text-base">
                      Erreur de chargement
                    </h3>
                    <p className="text-red-800 text-xs sm:text-sm mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Loading State */}
            {loading && !error && (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-flex items-center px-6 py-4 bg-white rounded-xl shadow-lg border border-blue-100">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-700 font-medium text-base">
                    Chargement des produits en stock critique...
                  </span>
                </div>
              </div>
            )}
            {/* Products Table */}
            {!loading && !error && (
              <>
                {products.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Desktop Table Header */}
                    <div className="hidden lg:block bg-gray-50 px-6 py-4 border-b border-gray-200">
                      {/* Ajustement des colonnes pour un meilleur placement sur grand écran */}
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {" "}
                          {/* + d'espace pour Produit/Description */}
                          Produit & Description
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                          Stock
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                          Prix d&apos;achat
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                          Prix de vente
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                          Marge
                        </div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="divide-y divide-gray-100">
                      {products.map((product) => {
                        const margin = product.price - product.purchasePrice;
                        const marginPercentage =
                          product.purchasePrice > 0
                            ? ((margin / product.purchasePrice) * 100).toFixed(
                                1
                              )
                            : "0.0";

                        return (
                          <div
                            key={product.id}
                            className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-red-50 transition-colors duration-150 border-l-4 border-red-500" // Ajout d'une barre de couleur pour l'urgence
                          >
                            {/* Desktop Layout */}
                            <div className="hidden lg:grid grid-cols-6 gap-6 items-center">
                              {/* Nom du produit & Description (col-span-2) */}
                              <div className="col-span-2">
                                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                                  {product.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-1">
                                  Réf: {product.id.slice(-8)}...
                                </p>
                                <div className="text-sm text-gray-700">
                                  {product.description ? (
                                    <p className="line-clamp-2 text-xs text-gray-600 italic">
                                      {product.description}
                                    </p>
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">
                                      Aucune description
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Stock avec alerte */}
                              <div className="w-24">
                                <StockAlert stock={product.stock} />
                              </div>

                              {/* Prix d'achat */}
                              <div className="text-right">
                                <span className="text-sm font-semibold text-gray-700 font-mono">
                                  {formatPrice(product.purchasePrice)}
                                </span>
                              </div>

                              {/* Prix de vente */}
                              <div className="text-right">
                                <span className="text-base font-bold text-gray-900 font-mono">
                                  {formatPrice(product.price)}
                                </span>
                              </div>

                              {/* Marge */}
                              <div className="text-right space-y-1">
                                <div
                                  className={`text-base font-bold font-mono ${
                                    margin >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatPrice(margin)}
                                </div>
                                <div
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    parseFloat(marginPercentage) >= 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {marginPercentage}%
                                </div>
                              </div>
                            </div>

                            {/* Mobile/Tablet Layout (Style conservé et affiné) */}
                            <div className="lg:hidden space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 mb-2">
                                    Réf: {product.id.slice(-8)}...
                                  </p>
                                  {product.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                                <StockAlert stock={product.stock} />
                              </div>

                              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Prix d&apos;achat
                                  </div>
                                  <div className="text-sm font-semibold text-gray-700 font-mono">
                                    {formatPrice(product.purchasePrice)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Prix de vente
                                  </div>
                                  <div className="text-sm font-bold text-gray-900 font-mono">
                                    {formatPrice(product.price)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Marge
                                  </div>
                                  <div
                                    className={`text-sm font-bold font-mono ${
                                      margin >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {formatPrice(margin)}
                                  </div>
                                  <div
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                      parseFloat(marginPercentage) >= 0
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {marginPercentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    <Pagination />
                  </div>
                ) : (
                  // Empty State
                  <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-green-200">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ✅ Aucun produit en stock critique
                    </h3>
                    <p className="text-base text-gray-600 max-w-md mx-auto px-4">
                      Excellent ! Tous vos produits ont un stock supérieur à **
                      {stockThreshold} unités**. Votre inventaire est bien géré.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
