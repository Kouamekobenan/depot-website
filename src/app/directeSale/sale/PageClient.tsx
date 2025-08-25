"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
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
// Composant pour les métriques de vente
const SalesMetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  subtitle?: string;
  variant?: "primary" | "secondary" | "accent";
}> = ({ title, value, icon, href = "#", subtitle, variant = "primary" }) => {
  const variantClasses = {
    primary:
      "border-orange-400 border-2 border-dashed bg-gradient-to-br from-orange-50 to-orange-100",
    secondary:
      "border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150",
    accent:
      "border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150",
  };
  return (
    <Link
      href={href}
      className="group block transform transition-all duration-200 hover:scale-105 h-full"
    >
      <div
        className={`flex flex-col border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 h-full min-h-[160px] ${variantClasses[variant]}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-300 rounded-lg group-hover:bg-green-300 transition-colors duration-200">
            {icon}
          </div>
          <h3 className="font-medium text-gray-700 text-sm uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="mt-auto">
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </Link>
  );
};
// Composant pour le bouton de création de vente
const CreateSaleButton: React.FC = () => (
  <Link href="/directeSale/create" className="group block h-full">
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
            Nouvelle vente
          </h3>
          <p className="text-xs text-orange-600/80 font-medium">
            Cliquez pour créer une nouvelle vente
          </p>
        </div>
      </div>
    </div>
  </Link>
);
// Composant pour le tableau des articles
const SaleItemsTable: React.FC<{ items: directSaleItem[] }> = ({ items }) => (
  <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
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
);
// Composant pour une carte de vente
const SaleCard: React.FC<{ sale: directSaleDto; index: number }> = ({
  sale,
  index,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent">
      <div className="flex justify-between items-start">
        <div className="flex justify-between w-full ">
          <aside>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Vente #{String(index + 1).padStart(3, "0")}
            </h3>
            <p className="text-sm text-gray-600">
              Client : {sale.customerId ?? "Client non renseigné"}
            </p>
          </aside>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/print/${sale.id}`}
            className="bg-green-300 p-1.5 rounded-md"
          >
            Imprimer
          </Link>
          {sale.isCredit && (
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <CreditCard size={12} className="mr-1" />
              Crédit
            </span>
          )}
        </div>
      </div>
    </div>
    <div className="px-6 py-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-green-600 font-medium">Montant payé</p>
          <p className="text-lg font-bold text-green-700">
            {Number(sale.amountPaid).toLocaleString()} FCFA
          </p>
        </div>
        {sale.dueAmount > 0 && (
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-600 font-medium">Reste à payer</p>
            <p className="text-lg font-bold text-red-700">
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
        <div className="flex-1 flex items-center justify-center min-h-screen">
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
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center">
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
        <header className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestion des ventes journalière du:{" "}
              <span className="font-bold text-green-500">{dateDay}</span>
            </h1>
            <p className="text-gray-600">
              Gérez et suivez vos ventes directes en temps réel
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SalesMetricCard
              title="Ventes créditées"
              value={salesMetrics.creditSalesCount}
              icon={<CreditCard size={20} className="text-white" />}
              href="/directeSale/credit"
              variant="primary"
            />
            <SalesMetricCard
              title="Chiffre d'affaires"
              value={`${salesMetrics.totalAmount.toLocaleString()} FCFA`}
              icon={<TrendingUp size={20} className="text-white" />}
              subtitle="Total journalier"
              variant="secondary"
            />
            <SalesMetricCard
              title="Nombre de ventes"
              value={salesMetrics.totalSalesCount}
              icon={<Calendar size={20} className="text-white" />}
              subtitle="Aujourd'hui"
              variant="accent"
            />
            <CreateSaleButton />
          </div>
        </header>
        {/* Liste des ventes */}
        <section className="px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Historique des ventes ({salesMetrics.totalSalesCount})
            </h2>
          </div>
          {salesMetrics.totalSalesCount === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune vente enregistrée
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre première vente
              </p>
              <Link
                href="/directeSale/create"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Créer une vente
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
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
