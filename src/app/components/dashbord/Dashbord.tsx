"use client";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/prisma/api";
import { deliveryDto, productItems } from "@/app/types/type";
import {
  Activity,
  Blocks,
  ChartColumnIncreasing,
  ChartLine,
  Check,
  Codesandbox,
  HandCoins,
  Package,
  ShoppingCart,
  Siren,
  Truck,
  User,
  Watch,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  TooltipProps,
} from "recharts";
import SaleDashbord from "../saleDashbord/SaleDashbord";
// Interface pour les données du graphique des produits
interface ChartData {
  name: string;
  stock: number;
}

// Interface pour les données du graphique des livraisons
interface DeliveryChartData {
  name: string;
  amount: number;
  count: number;
  status: "completed" | "pending" | "cancelled";
}

// Interface pour les statistiques de livraison
interface DeliveryStats {
  totalDeliveries: number;
  totalAmount: number;
  totalDeliveryPersons: number;
  averageDeliveryAmount: number;
  completedDeliveries: number;
  pendingDeliveries: number;
}

// Interface pour les props du tooltip personnalisé
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData | DeliveryChartData;
  }>;
  label?: string;
}
// Interface pour les erreurs d'API
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}
// Interface pour les produits du dashboard
interface DashboardProps {
  lowStockThreshold?: number;
  title?: string;
}
export default function Dashboard({ lowStockThreshold = 10 }: DashboardProps) {
  // États du composant
  const [product, setProduct] = useState<productItems[]>([]);
  const [deliveryData, setDeliveryData] = useState<deliveryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"stock" | "delivery" | "sale">(
    "stock"
  );
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/product/tenant/${tenantId}`);

      if (!Array.isArray(response.data)) {
        throw new Error("Format de données invalide");
      }

      setProduct(response.data);
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des produits:", error);
      throw error;
    }
  }, [tenantId]);

  // Fonction pour récupérer les données de livraison
  const fetchDeliveryData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/delivery/day/${tenantId}`);
      console.log("les données de la livraison:", response.data);
      setDeliveryData(response.data);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des livraisons:", error);
      throw error;
    }
  }, [tenantId]);

  // Fonction pour récupérer toutes les données
  const fetchAllData = useCallback(async () => {
    if (isRefreshing) return; // Empêcher les appels multiples

    setIsRefreshing(true);
    setIsLoading(true);

    try {
      await Promise.all([fetchProducts(), fetchDeliveryData()]);
    } catch (error: unknown) {
      let errorMessage = "Erreur lors du chargement des données";

      const apiError = error as ApiError;

      if (apiError.response) {
        errorMessage = `Erreur serveur: ${apiError.response.status}`;
        if (apiError.response.data?.message) {
          errorMessage += ` - ${apiError.response.data.message}`;
        }
      } else if (apiError.request) {
        errorMessage =
          "Erreur de connexion - Vérifiez votre connexion internet";
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }

      setError(errorMessage);
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchProducts, fetchDeliveryData, isRefreshing]);

  // Chargement initial uniquement
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Transformation des données pour le graphique des stocks
  const chartData: ChartData[] = product.map((item) => ({
    name: item.name,
    stock: item.stock,
  }));

  // Transformation des données pour le graphique des livraisons
  const deliveryChartData: DeliveryChartData[] = deliveryData.map(
    (delivery) => {
      const totalAmount = delivery.deliveryProducts.reduce((sum, dp) => {
        const price = Number(dp.product.price);
        const quantity = Number(dp.quantity);
        return sum + price * quantity;
      }, 0);

      const status: "completed" | "pending" | "cancelled" =
        delivery.status === "IN_PROGRESS"
          ? "pending"
          : delivery.status === "COMPLETED"
          ? "completed"
          : "cancelled";

      return {
        name: delivery.deliveryPerson.name.split(" ")[0],
        amount: totalAmount,
        count: delivery.deliveryProducts.length,
        status,
      };
    }
  );

  // Fonction pour déterminer la couleur des barres de stock
  const getBarColor = (stock: number): string => {
    if (stock === 0) return "#dc2626";
    if (stock < lowStockThreshold) return "#ea580c";
    if (stock < lowStockThreshold * 2) return "#ca8a04";
    return "#16a34a";
  };

  // Fonction pour déterminer la couleur des barres de livraison
  const getDeliveryBarColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Tooltip personnalisé pour les stocks
  const CustomStockTooltip = ({
    active,
    payload,
    label,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const stock = payload[0].value;
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl shadow-2xl">
          <p className="font-bold text-white text-lg tracking-wide">{label}</p>
          <p className="text-sm text-gray-300 mt-2">
            Stock: <span className="font-bold text-orange-400">{stock}</span>{" "}
            unité
            {stock > 1 ? "s" : ""}
          </p>
          {stock === 0 && (
            <p className="text-xs text-red-400 font-bold mt-2 flex items-center gap-2">
              <Siren className="w-3 h-3" />
              Rupture de stock
            </p>
          )}
          {stock > 0 && stock < lowStockThreshold && (
            <p className="text-xs text-amber-400 font-bold mt-2 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Stock faible
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Tooltip personnalisé pour les livraisons
  const CustomDeliveryTooltip = ({
    active,
    payload,
    label,
  }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DeliveryChartData;
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl shadow-2xl">
          <p className="font-bold text-white text-lg tracking-wide">{label}</p>
          <p className="text-sm text-gray-300 mt-2">
            Montant:{" "}
            <span className="font-bold text-emerald-400">
              {data.amount.toLocaleString()} FCFA
            </span>
          </p>
          <p className="text-sm text-gray-300">
            Livraisons:{" "}
            <span className="font-bold text-blue-400">{data.count}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2 capitalize">
            Statut:{" "}
            <span
              className={`font-bold ${
                data.status === "completed"
                  ? "text-emerald-400"
                  : data.status === "pending"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {data.status === "completed"
                ? "Terminé"
                : data.status === "pending"
                ? "En cours"
                : "Annulé"}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calcul des statistiques de stock
  const stockStats = {
    totalProducts: product.length,
    totalStock: product.reduce((sum, p) => sum + p.stock, 0),
    lowStock: product.filter((p) => p.stock > 0 && p.stock < lowStockThreshold)
      .length,
    outOfStock: product.filter((p) => p.stock === 0).length,
    averageStock:
      product.length > 0
        ? Math.round(
            product.reduce((sum, p) => sum + p.stock, 0) / product.length
          )
        : 0,
  };

  // Calcul des statistiques de livraison
  const deliveryStats: DeliveryStats = {
    totalDeliveries: deliveryData.length,
    totalAmount: deliveryData.reduce((sum, d) => {
      const total = d.deliveryProducts.reduce((acc, dp) => {
        const price = Number(dp.product.price);
        const quantity = Number(dp.quantity);
        return acc + price * quantity;
      }, 0);
      return sum + total;
    }, 0),
    totalDeliveryPersons: deliveryData.length,
    averageDeliveryAmount:
      deliveryData.length > 0
        ? Math.round(
            deliveryData.reduce((sum, d) => {
              const total = d.deliveryProducts.reduce((acc, dp) => {
                const price = Number(dp.product.price);
                const quantity = Number(dp.quantity);
                return acc + price * quantity;
              }, 0);
              return sum + total;
            }, 0) / deliveryData.length
          )
        : 0,

    completedDeliveries: deliveryData
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.deliveryProducts.length, 0),
    pendingDeliveries: deliveryData
      .filter((d) => d.status === "IN_PROGRESS")
      .reduce((sum, d) => sum + d.deliveryProducts.length, 0),
  };

  // Rendu pour l'état de chargement
  if (isLoading && !isRefreshing) {
    return (
      <div className="w-full p-8 min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 font-['Inter',sans-serif]">
        <div className="w-full h-[600px] bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 shadow-lg"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-orange-400/40"></div>
              </div>
              <p className="text-white font-bold text-xl tracking-wide">
                Chargement des données...
              </p>
              <p className="text-gray-400 text-sm mt-3 font-medium tracking-wide">
                Connexion sécurisée à l&apos;API en cours
              </p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu pour l'état d'erreur
  if (error) {
    return (
      <div className="w-full p-8 min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 font-['Inter',sans-serif]">
        <div className="w-full h-[600px] bg-red-900/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-red-700/30">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-8xl mb-6 filter drop-shadow-lg">
                ⚠️
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
                Erreur de chargement
              </h3>
              <p className="text-gray-300 mb-8 text-sm leading-relaxed font-medium">
                {error}
              </p>
              <button
                onClick={fetchAllData}
                disabled={isRefreshing}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl hover:from-orange-500 hover:to-orange-400 transition-all duration-300 font-bold text-sm tracking-wide shadow-xl hover:shadow-orange-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isRefreshing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Rechargement...
                  </span>
                ) : (
                  "Réessayer"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="w-full p-8 min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* Effets de fond décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* En-tête avec onglets */}
        <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard Analytics
              </h1>
              {lastUpdated && (
                <p className="text-sm text-gray-400 mt-2 font-medium tracking-wide">
                  Dernière mise à jour :{" "}
                  {lastUpdated.toLocaleString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>
            <button className="flex items-center gap-3 px-8 py-4 text-sm bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wide shadow-xl hover:shadow-gray-500/20 transform hover:scale-50 disabled:hover:scale-100 border border-gray-600/50">
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {"Actualiser maintenant"}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 bg-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === "stock"
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-2xl shadow-orange-500/30 border-2 border-orange-400/50"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-600/30"
              }`}
            >
              <Blocks className="w-5 h-5" />
              <span className="tracking-wide">Gestion des Stocks</span>
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === "delivery"
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-2xl shadow-orange-500/30 border-2 border-orange-400/50"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-600/30"
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="tracking-wide">Suivi des Livraisons</span>
            </button>
            <button
              onClick={() => setActiveTab("sale")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === "sale"
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-2xl shadow-orange-500/30 border-2 border-orange-400/50"
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50 border-2 border-transparent hover:border-gray-600/30"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="tracking-wide">Gestion des Ventes</span>
            </button>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === "stock" && (
          <>
            {/* Cartes de statistiques de stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-orange-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Total Produits
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {stockStats.totalProducts}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl border border-orange-400/30 group-hover:from-orange-500/30 group-hover:to-amber-500/30 transition-all duration-300">
                    <Package className="text-orange-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Stock Total
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {stockStats.totalStock}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <ChartColumnIncreasing className="text-blue-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-emerald-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Stock Moyen
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {stockStats.averageStock}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl border border-emerald-400/30 group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300">
                    <ChartLine className="text-emerald-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-amber-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Stock Faible
                    </p>
                    <p className="text-xl font-black text-amber-400 tracking-tight">
                      {stockStats.lowStock}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 group-hover:from-amber-500/30 group-hover:to-yellow-500/30 transition-all duration-300">
                    <Activity className="text-amber-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-red-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Ruptures
                    </p>
                    <p className="text-xl font-black text-red-400 tracking-tight">
                      {stockStats.outOfStock}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl border border-red-400/30 group-hover:from-red-500/30 group-hover:to-rose-500/30 transition-all duration-300">
                    <Siren className="text-red-400 w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique des stocks */}
            <div className="w-full bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                    Analyse du Stock par Produit
                  </h2>
                  <p className="text-gray-400 font-medium tracking-wide">
                    Vue d&apos;ensemble des niveaux de stock actuels
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-green-500/20 rounded-2xl border border-green-400/30">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-green-400/50 shadow-lg"></span>
                  <span className="text-sm font-bold text-green-400 tracking-wide">
                    Données en temps réel
                  </span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center bg-gray-900/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mb-8 relative">
                      <span className="text-9xl block opacity-30 filter grayscale">
                        📊
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-orange-500/10 rounded-full blur-xl"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
                      Aucune donnée disponible
                    </h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed font-medium tracking-wide">
                      Les statistiques de stock apparaîtront automatiquement dès
                      que les données seront chargées depuis votre système de
                      gestion
                    </p>
                    <div className="mt-8 flex justify-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce shadow-orange-500/50 shadow-lg"></div>
                      <div
                        className="w-3 h-3 bg-orange-400 rounded-full animate-bounce shadow-orange-400/50 shadow-lg"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-orange-300 rounded-full animate-bounce shadow-orange-300/50 shadow-lg"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] bg-gray-900/50 rounded-3xl border border-gray-700/50 p-6 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        strokeOpacity={0.4}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 13,
                          fill: "#D1D5DB",
                          fontWeight: "600",
                        }}
                        axisLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        tickLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis
                        tick={{
                          fontSize: 13,
                          fill: "#D1D5DB",
                          fontWeight: "600",
                        }}
                        axisLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        tickLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                      />
                      <Tooltip content={<CustomStockTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="stock"
                        name="Stock disponible"
                        radius={[8, 8, 0, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.stock)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Légende des couleurs pour les stocks */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                    Classification des Niveaux de Stock
                  </h3>
                  <p className="text-sm text-gray-400 font-medium tracking-wide">
                    Code couleur pour l&apos;évaluation rapide des stocks
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-400/20 backdrop-blur-sm hover:bg-emerald-500/20 transition-all duration-300">
                    <div className="w-6 h-6 bg-emerald-500 rounded-xl shadow-emerald-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block">
                        Stock Suffisant
                      </span>
                      <p className="text-emerald-400 text-xs mt-1 font-medium">
                        ≥{lowStockThreshold * 2} unités
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-400/20 backdrop-blur-sm hover:bg-amber-500/20 transition-all duration-300">
                    <div className="w-6 h-6 bg-amber-500 rounded-xl shadow-amber-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block">
                        Stock Moyen
                      </span>
                      <p className="text-amber-400 text-xs mt-1 font-medium">
                        {lowStockThreshold}-{lowStockThreshold * 2 - 1} unités
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-2xl border border-orange-400/20 backdrop-blur-sm hover:bg-orange-500/20 transition-all duration-300">
                    <div className="w-6 h-6 bg-orange-500 rounded-xl shadow-orange-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block">
                        Stock Faible
                      </span>
                      <p className="text-orange-400 text-xs mt-1 font-medium">
                        1-{lowStockThreshold - 1} unités
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-2xl border border-red-400/20 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-300">
                    <div className="w-6 h-6 bg-red-500 rounded-xl shadow-red-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block">
                        Rupture de Stock
                      </span>
                      <p className="text-red-400 text-xs mt-1 font-medium">
                        0 unité
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "delivery" && (
          <>
            {/* Cartes de statistiques de livraison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Livreurs Actifs
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {deliveryStats.totalDeliveryPersons}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl border border-purple-400/30 group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                    <User className="text-purple-400 w-8 h-8" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Total Livraisons
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {deliveryStats.totalDeliveries}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <Codesandbox className="text-blue-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-emerald-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Montant Total
                    </p>
                    <p className="text-xl font-black text-white tracking-tight">
                      {deliveryStats.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 font-bold mt-2 tracking-widest">
                      FCFA
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl border border-emerald-400/30 group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300">
                    <HandCoins className="text-emerald-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-green-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      Terminées
                    </p>
                    <p className="text-xl font-black text-green-400 tracking-tight">
                      {deliveryStats.completedDeliveries}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/30 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                    <Check className="text-green-400 w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 hover:shadow-amber-500/10 transition-all duration-300 transform hover:scale-105 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                      En Cours
                    </p>
                    <p className="text-xl font-black text-amber-400 tracking-tight">
                      {deliveryStats.pendingDeliveries}
                    </p>
                  </div>
                  <div className="p-1 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl border border-amber-400/30 group-hover:from-amber-500/30 group-hover:to-yellow-500/30 transition-all duration-300">
                    <Watch className="text-amber-400 w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique des livraisons par livreur */}
            <div className="w-full bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="mb-6 lg:mb-0">
                  <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                    Performance des Livreurs
                  </h2>
                  <p className="text-gray-400 font-medium tracking-wide">
                    Analyse des performances journalières en temps réel
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-emerald-400/50 shadow-lg"></span>
                    <span className="text-sm font-bold text-emerald-400 tracking-wide">
                      Suivi en temps réel
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-300 bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-700/50 tracking-wider">
                    {new Date().toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {deliveryChartData.length === 0 ? (
                <div className="h-[500px] flex items-center justify-center bg-gray-900/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mb-8 relative">
                      <span className="text-9xl block opacity-30 filter grayscale">
                        🚚
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-500/10 rounded-full blur-xl"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">
                      Aucune livraison aujourd&apos;hui
                    </h3>
                    <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed font-medium tracking-wide">
                      Les performances de livraison s&apos;afficheront
                      automatiquement dès que les livreurs commenceront leurs
                      tournées
                    </p>
                    <div className="mt-8 flex justify-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce shadow-blue-500/50 shadow-lg"></div>
                      <div
                        className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-blue-400/50 shadow-lg"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-blue-300 rounded-full animate-bounce shadow-blue-300/50 shadow-lg"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] bg-gray-900/50 rounded-3xl border border-gray-700/50 p-6 backdrop-blur-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deliveryChartData}
                      margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        strokeOpacity={0.4}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 13,
                          fill: "#D1D5DB",
                          fontWeight: "600",
                        }}
                        axisLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        tickLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis
                        tick={{
                          fontSize: 13,
                          fill: "#D1D5DB",
                          fontWeight: "600",
                        }}
                        axisLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                        tickLine={{ stroke: "#4B5563", strokeWidth: 2 }}
                      />
                      <Tooltip content={<CustomDeliveryTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Montant (FCFA)"
                        radius={[8, 8, 0, 0]}
                      >
                        {deliveryChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getDeliveryBarColor(entry.status)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Légende des couleurs pour les livraisons */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                    Statuts des Livraisons
                  </h3>
                  <p className="text-sm text-gray-400 font-medium tracking-wide">
                    Classification des livraisons par état d&apos;avancement
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-4 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-400/20 backdrop-blur-sm hover:bg-emerald-500/20 transition-all duration-300 transform hover:scale-105">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-emerald-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block text-base">
                        Livraisons Terminées
                      </span>
                      <p className="text-emerald-400 text-xs mt-2 font-medium tracking-wide">
                        Commandes livrées avec succès
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-amber-500/10 rounded-2xl border border-amber-400/20 backdrop-blur-sm hover:bg-amber-500/20 transition-all duration-300 transform hover:scale-105">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-amber-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block text-base">
                        Livraisons en Cours
                      </span>
                      <p className="text-amber-400 text-xs mt-2 font-medium tracking-wide">
                        Commandes en cours de livraison
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-red-500/10 rounded-2xl border border-red-400/20 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-300 transform hover:scale-105">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-red-500/50 shadow-lg"></div>
                    <div className="flex-1">
                      <span className="text-white font-bold tracking-wide block text-base">
                        Livraisons Annulées
                      </span>
                      <p className="text-red-400 text-xs mt-2 font-medium tracking-wide">
                        Commandes annulées ou échouées
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "sale" && (
          <div className="bg-gray-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
            <SaleDashbord />
          </div>
        )}
      </div>
    </div>
  );
}
