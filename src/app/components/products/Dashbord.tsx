"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Activity,
  ShoppingCart,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import api from "@/app/prisma/api";
import { productItems } from "@/app/types/type";
import { useAuth } from "@/app/context/AuthContext";

// Types pour les statistiques
interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalSalesValue: number;
  totalProfit: number;
  lowStockCount: number;
}

// Configuration des constantes
// const CURRENCY = "FCFA";
const LOW_STOCK_THRESHOLD = 10;

// Hook personnalisé pour les statistiques
const useProductStats = (products: productItems[]): DashboardStats => {
  return useMemo(() => {
    if (!products.length) {
      return {
        totalProducts: 0,
        totalStock: 0,
        totalSalesValue: 0,
        totalProfit: 0,
        lowStockCount: 0,
      };
    }

    return products.reduce(
      (stats, product) => {
        const salesPrice = Number(product.price) || 0;
        const purchasePrice = Number(product.purchasePrice) || 0;
        const stock = product.stock || 0;

        return {
          totalProducts: stats.totalProducts + 1,
          totalStock: stats.totalStock + stock,
          totalSalesValue: stats.totalSalesValue + salesPrice * stock,
          totalProfit:
            stats.totalProfit + (salesPrice * stock - purchasePrice * stock),
          lowStockCount:
            stats.lowStockCount + (stock < LOW_STOCK_THRESHOLD ? 1 : 0),
        };
      },
      {
        totalProducts: 0,
        totalStock: 0,
        totalSalesValue: 0,
        totalProfit: 0,
        lowStockCount: 0,
      }
    );
  }, [products]);
};

// Composant pour une carte de statistique
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  warning?: boolean;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  trend,
  warning = false,
  description,
}) => (
  <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-7 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {/* Warning pulse effect */}
    {warning && (
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 animate-pulse" />
    )}
    {/* Content */}
    <div className="relative">
      <div className="flex items-start justify-between mb-5">
        <div
          className={`p-3.5 ${iconBgColor} rounded-xl shadow-lg shadow-slate-200/40 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="h-6 w-6 text-white relative z-10" />
        </div>

        <div className="flex items-center space-x-2">
          {warning && (
            <div className="flex items-center px-2 py-1 bg-orange-100 border border-orange-200 rounded-full">
              <AlertTriangle className="h-3 w-3 text-orange-600 animate-pulse" />
            </div>
          )}
          {trend && (
            <div
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                trend.isPositive
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-red-700 bg-red-50 border border-red-200"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-600 tracking-wide uppercase leading-tight">
          {title}
        </h3>
        <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        )}
      </div>
    </div>
  </div>
);

// Composant pour le bouton d'ajout de produit
const AddProductCard: React.FC = () => (
  <Link href="/products/add" className="group block h-full">
    <div className="relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-2xl border-2 border-dashed border-orange-300/60 p-7 h-full flex flex-col items-center justify-center hover:from-orange-100 hover:to-orange-200 hover:border-orange-400/80 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-200/50 group-hover:-translate-y-0.5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce" />
      <div className="absolute bottom-4 left-4 w-6 h-6 bg-orange-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 animate-bounce" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-5">
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg shadow-orange-200/50">
            <Plus className="h-7 w-7 text-white group-hover:rotate-180 transition-transform duration-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-orange-700 tracking-wide">
            Nouveau produit
          </h3>
          <p className="text-xs text-orange-600/80 font-medium">
            Cliquez pour créer un nouveau produit
          </p>
        </div>
      </div>
    </div>
  </Link>
);

// Composant de gestion d'erreur
const ErrorDisplay: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-red-50 via-red-50 to-red-100 rounded-2xl border border-red-200/60 shadow-sm">
    <div className="relative mb-6">
      <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-200/50">
        <AlertTriangle className="h-8 w-8 text-white" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75" />
    </div>

    <div className="text-center space-y-4 max-w-md">
      <h3 className="text-xl font-bold text-red-800 tracking-tight">
        Erreur de chargement
      </h3>
      <p className="text-red-600/80 font-medium leading-relaxed">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-200/50 hover:shadow-xl"
      >
        <Activity className="w-4 h-4 mr-2" />
        Réessayer
      </button>
    </div>
  </div>
);

// Composant principal du Dashboard
export default function Dashboard() {
  // États
  const [products, setProducts] = useState<productItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!tenantId) {
        setError("Aucun tenant trouvé");
        setIsLoading(false);
        return;
      }
      const response = await api.get(`/product/tenant/${tenantId}`);
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      setProducts(data);
    } catch (err: unknown) {
      console.error("Erreur lors de la récupération des produits:", err);

      let errorMessage = "Erreur lors de la récupération des produits";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String(err.message);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Effet pour charger les données au montage
  useEffect(() => {
    if (tenantId) {
      fetchProducts();
    }
  }, [tenantId, fetchProducts]);

  // Calcul des statistiques avec le hook personnalisé
  const stats = useProductStats(products);

  // Fonction pour formater les prix
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-200/50 flex items-center justify-center">
              <Package className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Chargement du tableau de bord
          </h3>
          <p className="text-slate-600">Récupération des données produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <ErrorDisplay error={error} onRetry={fetchProducts} />
      </div>
    );
  }

  // Configuration des cartes de statistiques
  const statCards = [
    {
      title: "Total des produits",
      value: stats.totalProducts,
      icon: Package,
      iconBgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      warning: stats.totalProducts === 0,
      description: "Produits dans l'inventaire",
      trend:
        stats.totalProducts > 0 ? { value: 8.5, isPositive: true } : undefined,
    },
    {
      title: "Stock total",
      value: `${stats.totalStock.toLocaleString()} unités`,
      icon: Layers,
      iconBgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      warning: stats.lowStockCount > 0,
      description: "Total des unités en stock",
      trend: { value: 12.3, isPositive: true },
    },
    {
      title: "Valeur des ventes",
      value: `${formatCurrency(stats.totalSalesValue)}`,
      icon: ShoppingCart,
      iconBgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      description: "Valeur totale des ventes",
      trend: { value: 15.7, isPositive: true },
    },
    {
      title: "Bénéfices estimés",
      value: `${formatCurrency(stats.totalProfit)}`,
      icon: Target,
      iconBgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      description: "Profit total estimé",
      trend:
        stats.totalProfit > 0 ? { value: 18.4, isPositive: true } : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Custom Font Imports */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap");

        * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .font-mono {
          font-family: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code",
            monospace;
        }

        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-600 rounded-2xl shadow-lg shadow-blue-200/40">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight text-shadow-sm">
                    Dashboard Produits
                  </h1>
                  <p className="text-slate-600 text-lg font-medium">
                    Vue d&apos;ensemble de vos produits et statistiques avancées
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link href="/dashbord">
                  <button className="group cursor-pointer relative inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-slate-600 via-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 active:scale-95">
                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="relative text-sm tracking-wide">
                      Retour au dashboard
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Alert for Low Stock */}
        {stats.lowStockCount > 0 && (
          <div className="relative bg-gradient-to-r from-orange-50 via-orange-50 to-red-50 rounded-2xl border border-orange-200/60 p-6 shadow-sm overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 animate-pulse" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-200/50">
                  <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-orange-800 tracking-tight">
                    ⚠️ Attention - Stock critique
                  </h3>
                  <p className="text-orange-700/90 font-medium">
                    <span className="font-bold text-red-700">
                      {stats.lowStockCount}
                    </span>{" "}
                    produit
                    {stats.lowStockCount > 1 ? "s ont" : " a"} un stock
                    inférieur à{" "}
                    <span className="font-bold">{LOW_STOCK_THRESHOLD}</span>{" "}
                    unités
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link href="/stockfaible">
                  <button className="group inline-flex items-center px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-200/50 hover:shadow-xl">
                    <Zap className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="text-sm tracking-wide">
                      Voir les stocks faibles
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}

          {/* Enhanced Add Product Card */}
          <div className="sm:col-span-1">
            <AddProductCard />
          </div>
        </div>

        {/* Additional Analytics Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl mr-4 shadow-lg shadow-indigo-200/40">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Aperçu analytique
                </h2>
                <p className="text-slate-600 font-medium">
                  Métriques avancées de votre inventaire
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-200/50 px-2 py-1 rounded-full">
                    Excellent
                  </span>
                </div>
                <h3 className="text-sm font-bold text-emerald-800 mb-1">
                  Marge moyenne
                </h3>
                <p className="text-2xl font-bold text-emerald-900 font-mono">
                  {stats.totalProducts > 0
                    ? Math.round(
                        (stats.totalProfit / stats.totalSalesValue) * 100
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-200/50 px-2 py-1 rounded-full">
                    Actif
                  </span>
                </div>
                <h3 className="text-sm font-bold text-blue-800 mb-1">
                  Stock moyen/produit
                </h3>
                <p className="text-2xl font-bold text-blue-900 font-mono">
                  {stats.totalProducts > 0
                    ? Math.round(stats.totalStock / stats.totalProducts)
                    : 0}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-700 bg-purple-200/50 px-2 py-1 rounded-full">
                    Suivi
                  </span>
                </div>
                <h3 className="text-sm font-bold text-purple-800 mb-1">
                  Valeur moyenne/produit
                </h3>
                <p className="text-2xl font-bold text-purple-900 font-mono">
                  {formatCurrency(
                    stats.totalProducts > 0
                      ? Math.round(stats.totalSalesValue / stats.totalProducts)
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
