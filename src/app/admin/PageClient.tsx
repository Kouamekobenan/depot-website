"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Truck,
  TrendingUp,
  BarChart3,
  Search,
  Loader2,
  Sheet,
  SwissFranc,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Target,
  Menu,
  X,
} from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { dashbordItems, deliveryProducts } from "../types/type";
import api from "../prisma/api";
import Link from "next/link";

const PageClientAdmin = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [dataDashboard, setDashboard] = useState<dashbordItems>();
  const [startDate, setStartDate] = useState("2025-07-01");
  const [endDate, setEndDate] = useState("2025-07-22");
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<deliveryProducts[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalLivraison = deliveries.reduce(
    (sum, delivery) => sum + Number(delivery.totalPrice),
    0
  );
  // Charger les stats globales
  useEffect(() => {
    if (!tenantId) return;
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      try {
        const res = await api.get(`/dashbord/${tenantId}`);
        setDashboard(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, [tenantId]);

  // Charger les ventes sur période
  const fetchSaleDay = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const resp = await api.get(`/dashbord/day-sale/${tenantId}`, {
        params: { startDate, endDate },
      });
      setAmountTotal(resp.data?.total ?? 0);
    } catch (error) {
      console.error("Erreur lors du chargement des ventes par jour:", error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, startDate, endDate, setAmountTotal, setLoading]);

  useEffect(() => {
    fetchSaleDay();
  }, [tenantId, startDate, endDate, fetchSaleDay]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await api.get(`/delivery/tenant/${tenantId}`);
        setDeliveries(res.data);
      } catch (error: unknown) {
        console.log("Erreur lors du chargement", error);
      }
    };
    fetchDeliveries();
  }, [tenantId]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection = "up",
    iconColor,
    description,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendDirection?: "up" | "down";
    iconColor: string;
    description?: string;
  }) => (
    <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 lg:p-7 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div
            className={`p-2.5 sm:p-3.5 ${iconColor} rounded-lg sm:rounded-xl shadow-lg shadow-slate-200/40 group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${
                trendDirection === "up"
                  ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                  : "text-red-700 bg-red-50 border border-red-200"
              }`}
            >
              {trendDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{trend}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-600 tracking-wide uppercase leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-none">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-slate-500 font-medium line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 lg:p-7 animate-pulse">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 rounded-lg sm:rounded-xl"></div>
        <div className="w-12 sm:w-16 h-5 sm:h-6 bg-slate-200 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-6 sm:h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

        .backdrop-blur-xs {
          backdrop-filter: blur(2px);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .mobile-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }

          .mobile-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 280px;
            background: white;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
          }

          .mobile-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="mobile-sidebar-overlay md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Mobile Sidebar */}
        <div
          className={`mobile-sidebar ${sidebarOpen ? "open" : ""} md:hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">12DEPOT</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Navbar />
        </div>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Mobile Menu Button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/80 rounded-lg border border-slate-200"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
          </div>
          {/* Enhanced Header */}
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="relative flex-shrink-0">
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-200/40">
                      <Sheet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div className="space-y-1 sm:space-y-2 min-w-0">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-shadow-sm">
                      Tableau de bord
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-medium">
                        Page administrateur de
                      </p>
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 max-w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                        <span className="truncate max-w-32 sm:max-w-none">
                          {user?.tenantName}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Link href="/history-sale" className="block w-full sm:w-auto">
                    <button className="group relative w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 active:scale-95">
                      <div className="absolute inset-0 bg-white/10 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative text-sm tracking-wide">
                        Historique des ventes
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dashboardLoading ? (
              Array(6)
                .fill(0)
                .map((_, i) => <LoadingSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  title="Chiffre d'affaires Ventes"
                  value={`${formatCurrency(
                    dataDashboard?.totalRevenue || 0
                  )} FCFA`}
                  icon={DollarSign}
                  iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
                  trend="+12.5%"
                  trendDirection="up"
                  description="Revenue total des ventes"
                />
                <StatCard
                  title="Chiffre d'affaires Livraisons"
                  value={`${formatCurrency(totalLivraison)} FCFA`}
                  icon={Truck}
                  iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                  trend="+8.2%"
                  trendDirection="up"
                  description="Revenue total des livraisons"
                />
                <StatCard
                  title="Produits Vendus"
                  value={dataDashboard?.totalSales || 0}
                  icon={Package}
                  iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
                  trend="+15.3%"
                  trendDirection="up"
                  description="Total des produits vendus"
                />
                <StatCard
                  title="Total Livraisons"
                  value={dataDashboard?.totalDeliveries || 0}
                  icon={Target}
                  iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
                  trend="+5.7%"
                  trendDirection="up"
                  description="Livraisons effectuées"
                />
                <StatCard
                  title="Ventes Aujourd'hui"
                  value={dataDashboard?.salesToday || 0}
                  icon={TrendingUp}
                  iconColor="bg-gradient-to-br from-pink-500 to-rose-600"
                  trend="+22.1%"
                  trendDirection="up"
                  description="Ventes du jour en cours"
                />
                <StatCard
                  title="Livraisons Aujourd'hui"
                  value={dataDashboard?.deliveriesToday || 0}
                  icon={Activity}
                  iconColor="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  trend="+18.9%"
                  trendDirection="up"
                  description="Livraisons du jour"
                />
              </>
            )}
          </div>

          {/* Enhanced Period Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl sm:rounded-2xl mr-4 sm:mr-6 shadow-lg shadow-slate-200/40">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Analyse par période
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    Consultez les performances sur une période personnalisée
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
                <div className="space-y-3">
                  <label className="flex items-center text-xs sm:text-sm font-bold text-slate-700 tracking-wide uppercase">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-slate-500" />
                    Date de début
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-slate-50/80 border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm hover:bg-white text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center text-xs sm:text-sm font-bold text-slate-700 tracking-wide uppercase">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-slate-500" />
                    Date de fin
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-slate-50/80 border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm hover:bg-white text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide uppercase opacity-0 hidden lg:block">
                    Action
                  </label>
                  <button
                    onClick={fetchSaleDay}
                    disabled={loading}
                    className="group w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 flex items-center justify-center space-x-2 sm:space-x-3 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="text-sm tracking-wide">
                          Analyse...
                        </span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-sm tracking-wide">Analyser</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 border-emerald-500 shadow-sm sm:col-span-2 lg:col-span-1">
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <SwissFranc className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-emerald-700 tracking-wide uppercase">
                      Montant total
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-900 font-mono tracking-tight">
                      {formatCurrency(amountTotal)}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageClientAdmin;
