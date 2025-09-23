"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import Navbar from "@/app/components/navbar/Navbar";
import api, { formatDate } from "@/app/prisma/api";
import { directSaleDto, directSaleItem } from "@/app/types/type";
import { useAuth } from "@/app/context/AuthContext";

// Types pour une meilleure structure
interface SalesMetrics {
  totalAmount: number;
  creditSalesCount: number;
  totalSalesCount: number;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Composant pour les métriques de vente (Version Professionnelle)
const SalesMetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  subtitle?: string;
  variant?: "primary" | "secondary" | "accent";
  trend?: string;
}> = ({
  title,
  value,
  icon,
  href = "#",
  subtitle,
  variant = "primary",
  trend,
}) => {
  const variantClasses = {
    primary: {
      bg: "bg-gradient-to-br from-blue-600 to-blue-700",
      bgLight: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      iconBg: "bg-blue-500",
      shadow: "shadow-blue-100",
    },
    secondary: {
      bg: "bg-gradient-to-br from-emerald-600 to-emerald-700",
      bgLight: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      iconBg: "bg-emerald-500",
      shadow: "shadow-emerald-100",
    },
    accent: {
      bg: "bg-gradient-to-br from-purple-600 to-purple-700",
      bgLight: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      iconBg: "bg-purple-500",
      shadow: "shadow-purple-100",
    },
  };

  const classes = variantClasses[variant];

  return (
    <Link
      href={href}
      className="group block transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    >
      <div
        className={`relative bg-white rounded-2xl border ${classes.border} p-4 sm:p-6 shadow-sm hover:shadow-lg ${classes.shadow} transition-all duration-300 overflow-hidden`}
      >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
          <div
            className={`w-full h-full ${classes.bg} rounded-full transform translate-x-8 -translate-y-8`}
          ></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${classes.bg} rounded-xl shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUpRight className={`w-5 h-5 ${classes.text}`} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          <div className="flex items-end justify-between">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {value}
            </p>
            {trend && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Composant pour le bouton de création de vente (Version Mobile Optimisée)
const CreateSaleButton: React.FC = () => (
  <Link href="/directeSale/create" className="group block">
    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 sm:p-6 h-full flex flex-col items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-200/50 group-hover:-translate-y-1 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent"></div>

      {/* Floating elements */}
      <div className="absolute top-3 right-3 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
      <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="bg-white/20 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
          <Plus className="h-6 w-6 sm:h-8 sm:w-8 group-hover:rotate-180 transition-transform duration-300" />
        </div>

        <h3 className="text-sm sm:text-base font-bold mb-1">Nouvelle vente</h3>
        <p className="text-xs sm:text-sm text-white/80 font-medium">
          Créer une vente
        </p>
      </div>
    </div>
  </Link>
);

// Composant pour le tableau des articles (Responsive)
const SaleItemsTable: React.FC<{ items: directSaleItem[] }> = ({ items }) => (
  <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
    {/* Version Desktop */}
    <div className="hidden sm:block">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-700">
              Produit
            </th>
            <th className="px-4 py-3 text-center font-medium text-gray-700">
              Quantité
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">
              Prix unitaire
            </th>
            <th className="px-4 py-3 text-right font-medium text-gray-700">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {item.productName}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {Number(item.unitPrice).toLocaleString()} FCFA
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {Number(item.totalPrice).toLocaleString()} FCFA
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Version Mobile */}
    <div className="sm:hidden space-y-3 p-4">
      {items.map((item) => (
        <div key={item.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900 text-sm">
              {item.productName}
            </h4>
            <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Prix unitaire</span>
            <span className="text-gray-700">
              {Number(item.unitPrice).toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-semibold border-t border-gray-200 pt-2">
            <span className="text-gray-700">Total</span>
            <span className="text-gray-900">
              {Number(item.totalPrice).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Composant pour une carte de vente (Responsive)
const SaleCard: React.FC<{ sale: directSaleDto; index: number }> = ({
  sale,
  index,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Vente #{String(index + 1).padStart(3, "0")}
          </h3>
          <p className="text-sm text-gray-600">
            Client : {sale.customerId ?? "Client non renseigné"}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Link
            href={`/print/${sale.id}`}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
          >
            Imprimer
          </Link>
          {sale.isCredit && (
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800">
              <CreditCard size={12} className="mr-1" />
              Crédit
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="px-4 sm:px-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-600 font-medium">Montant payé</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-700">
            {Number(sale.amountPaid).toLocaleString()} FCFA
          </p>
        </div>
        {sale.dueAmount > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600 font-medium">Reste à payer</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-700">
              {Number(sale.dueAmount).toLocaleString()} FCFA
            </p>
          </div>
        )}
      </div>
      <SaleItemsTable items={sale.saleItems} />
    </div>
  </div>
);

// Composant principal
const DirectSaleHome: React.FC = () => {
  const [directSales, setDirectSales] = useState<directSaleDto[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const date = new Date();
  const dateDay = formatDate(date);

  // Métriques calculées
  const salesMetrics = useMemo<SalesMetrics>(() => {
    const totalAmount = directSales.reduce((sum, sale) => {
      return (
        sum +
        (sale.saleItems?.reduce(
          (itemSum, item) => itemSum + Number(item.totalPrice || 0),
          0
        ) || 0)
      );
    }, 0);

    return {
      totalAmount,
      creditSalesCount: directSales.filter((sale) => sale.isCredit).length,
      totalSalesCount: directSales.length,
    };
  }, [directSales]);

  // Fonction de récupération des données
  const fetchDirectSales = useCallback(async () => {
    try {
      setLoadingState({ isLoading: true, error: null });
      const response = await api.get(`/directeSale/tenant/${tenantId}`);

      if (Array.isArray(response.data?.data)) {
        setDirectSales(response.data.data);
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des ventes:", error);
      setLoadingState({
        isLoading: false,
        error: "Impossible de charger les données de vente",
      });
    } finally {
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDirectSales();
  }, [fetchDirectSales]);

  if (loadingState.isLoading) {
    return (
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingState.error) {
    return (
      <div className="flex">
        <Navbar />
        <div className="flex-1 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{loadingState.error}</p>
            <button
              onClick={fetchDirectSales}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {/* En-tête avec métriques */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              Gestion des ventes journalière du:{" "}
              <span className="font-bold text-emerald-600 block sm:inline">
                {dateDay}
              </span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gérez et suivez vos ventes directes en temps réel
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SalesMetricCard
              title="Ventes créditées"
              value={salesMetrics.creditSalesCount}
              icon={<CreditCard size={20} />}
              href="/directeSale/credit"
              variant="primary"
              trend="+12%"
            />
            <SalesMetricCard
              title="Chiffre d'affaires"
              value={`${salesMetrics.totalAmount.toLocaleString()}`}
              icon={<TrendingUp size={20} />}
              subtitle="FCFA - Total journalier"
              variant="secondary"
              trend="+8%"
            />
            <SalesMetricCard
              title="Nombre de ventes"
              value={salesMetrics.totalSalesCount}
              icon={<ShoppingCart size={20} />}
              subtitle="Transactions aujourd'hui"
              variant="accent"
            />
            <CreateSaleButton />
          </div>
        </header>

        {/* Liste des ventes */}
        <section className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Historique des ventes ({salesMetrics.totalSalesCount})
            </h2>
          </div>

          {salesMetrics.totalSalesCount === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune vente enregistrée
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
                Commencez par créer votre première vente pour voir l&apos;historique
                apparaître ici
              </p>
              <Link
                href="/directeSale/create"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Créer une vente
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {directSales.map((sale, index) => (
                <SaleCard key={sale.id} sale={sale} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DirectSaleHome;
