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
  // X,
  // Home,
  BellRing,
} from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import { useAuth } from "../context/AuthContext";
// Assurez-vous que ces types sont correctement définis
import { dashbordItems, deliveryProducts } from "../types/type";
import api from "../prisma/api"; // Renommé à 'apiClient' si possible pour éviter la confusion avec le type Prisma
import Link from "next/link";
import { subscribeToPush } from "../types/api/notification";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down";
  iconColor: string;
  description?: string;
}

const NotificationButton: React.FC = () => {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribeToPush(); // Assurez-vous que cette fonction gère les erreurs en interne ou ici
      alert("Notifications activées avec succès!");
    } catch (error) {
      console.error("Échec de l'activation des notifications:", error);
      alert(
        "Échec de l'activation des notifications. Voir la console pour les détails."
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isSubscribing}
      className="group relative inline-flex items-center justify-center 
        p-2 h-10 w-10 sm:h-auto sm:w-auto sm:p-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 
        disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold 
        rounded-xl transition-all duration-300 transform hover:scale-[1.05] shadow-lg shadow-yellow-400/50 hover:shadow-xl active:scale-95 
        ring-4 ring-yellow-400/50 animate-pulse-slow"
    >
      {isSubscribing ? (
        <Loader2 className="w-5 h-5 sm:mr-1 animate-spin" />
      ) : (
        // Sur mobile, l'icône prend tout l'espace (pas de mr-1)
        <BellRing className="w-5 h-5 sm:mr-1 group-hover:animate-pulse" />
      )}
      <span
        className="
          relative tracking-wide 
          hidden 
          sm:inline 
          md:inline
        "
      >
        {" "}
        {isSubscribing ? "Activation..." : "Activer les notifications"} 
      </span>
    </button>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = "up",
  iconColor,
  description,
}) => (
  <div className="group relative bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 ${iconColor} rounded-xl shadow-lg shadow-slate-200/40 group-hover:scale-105 transition-transform duration-300`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
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
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-600 tracking-wide uppercase leading-tight">
          {title}
        </h3>
        <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </p>
        {description && (
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        )}
      </div>
    </div>
  </div>
);

/**
 * Squelette de chargement pour les cartes
 */
const LoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-6 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
    </div>
  </div>
);

// --- Composant principal du Tableau de Bord ---

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // États du tableau de bord
  const [dataDashboard, setDashboard] = useState<dashbordItems | undefined>(
    undefined
  );
  const [startDate, setStartDate] = useState("2025-07-01");
  const [endDate, setEndDate] = useState("2025-07-22");
  const [amountTotal, setAmountTotal] = useState<number>(0);
  const [periodSaleLoading, setPeriodSaleLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<deliveryProducts[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calcul du total des livraisons
  const totalLivraison = deliveries.reduce(
    (sum, delivery) => sum + Number(delivery.totalPrice),
    0
  );

  /**
   * Formatage de la devise en FCFA pour la locale française
   */
  const formatCurrency = (amount: number): string => {
    // Utiliser la devise correcte si possible, sinon "FCFA" manuellement
    return (
      new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + " FCFA"
    );
  };
  // 1. Chargement des stats globales (au montage)
  useEffect(() => {
    if (!tenantId) return;

    const fetchDashboard = async () => {
      setDashboardLoading(true);
      try {
        const res = await api.get<dashbordItems>(`/dashbord/${tenantId}`);
        setDashboard(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du tableau de bord:", error);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, [tenantId]); // Dépendance à tenantId pour recharger si l'utilisateur change

  // 2. Chargement des ventes sur période (utilisé par le bouton et au montage)
  const fetchSaleDay = useCallback(async () => {
    if (!tenantId) return;
    setPeriodSaleLoading(true);
    try {
      // Utilisation de try/catch et spécification du type de retour
      const resp = await api.get<{ total: number }>(
        `/dashbord/day-sale/${tenantId}`,
        {
          params: { startDate, endDate },
        }
      );
      setAmountTotal(resp.data?.total ?? 0);
    } catch (error) {
      console.error("Erreur lors du chargement des ventes par jour:", error);
    } finally {
      setPeriodSaleLoading(false);
    }
  }, [tenantId, startDate, endDate]); // Dépendances strictes

  useEffect(() => {
    fetchSaleDay();
  }, [fetchSaleDay]); // Exécuter au montage et à chaque changement des dates/tenantId

  // 3. Chargement des livraisons
  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!tenantId) return;
      try {
        const res = await api.get<deliveryProducts[]>(
          `/delivery/tenant/${tenantId}`
        );
        setDeliveries(res.data);
      } catch (error) {
        // Le type 'unknown' est plus sûr que 'any'
        console.error("Erreur lors du chargement des livraisons:", error);
      }
    };
    fetchDeliveries();
  }, [tenantId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <style jsx global>{`
        // Conserver les polices et styles globaux
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
      `}</style>
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <div
          className={`
          fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          {/* Mobile Header (fermeture) */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-gray-900 to-gray-800"></div>
          {/* Navigation Content */}
          <div className="h-full overflow-y-auto">
            <Navbar />
          </div>
        </div>
        {/* Main Content */}
        <main className="flex-1 min-w-0 md:ml-0">
          {/* Top Bar Mobile (ouvre) */}
          <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="flex items-center justify-between p-4">
              <div className="">
                {" "}
                <Navbar />
              </div>

              <div className="flex items-center space-x-3">
                <div className="">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Dashboard
                  </h1>
                  {user?.tenantName && (
                    <p className="text-xs text-slate-600 font-medium truncate max-w-32">
                      {user.tenantName}
                    </p>
                  )}
                </div>
              </div>
              {/* Boutons d'actions Mobile */}
              <div className="flex space-x-2">
                <NotificationButton />
                <Link href="/history-sale">
                  <button className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors duration-200">
                    <BarChart3 className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/* Content Wrapper */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Desktop Header */}
            <div className="hidden md:block">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-8 relative overflow-hidden">
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
                      <div className="p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 rounded-2xl shadow-lg shadow-orange-200/40">
                        <Sheet className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold text-slate-900 tracking-tight text-shadow-sm">
                        Tableau de bord
                      </h1>
                      <div className="flex items-center space-x-2">
                        <p className="text-slate-600 text-lg font-medium">
                          Page administrateur de
                        </p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                          {user?.tenantName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Boutons d'actions Desktop */}
                  <div className="flex space-x-4">
                    <NotificationButton />
                    <Link href="/history-sale">
                      <button className="group relative inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 active:scale-95">
                        <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <BarChart3 className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative tracking-wide">
                          Historique des ventes
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {dashboardLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => <LoadingSkeleton key={i} />)
              ) : (
                <>
                  <StatCard
                    title="Chiffre d'affaires Ventes"
                    value={formatCurrency(dataDashboard?.totalRevenue || 0)}
                    icon={DollarSign}
                    iconColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    trend="+12.5%"
                    trendDirection="up"
                    description="Revenue total des ventes (toutes périodes)"
                  />
                  <StatCard
                    title="Chiffre d'affaires Livraisons"
                    value={formatCurrency(totalLivraison)}
                    icon={Truck}
                    iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="+8.2%"
                    trendDirection="up"
                    description="Revenue total des livraisons (toutes périodes)"
                  />
                  <StatCard
                    title="Produits Vendus"
                    value={dataDashboard?.totalSales || 0}
                    icon={Package}
                    iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
                    trend="+15.3%"
                    trendDirection="up"
                    description="Total des produits vendus (toutes périodes)"
                  />
                  <StatCard
                    title="Total Livraisons"
                    value={dataDashboard?.totalDeliveries || 0}
                    icon={Target}
                    iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
                    trend="+5.7%"
                    trendDirection="up"
                    description="Livraisons effectuées (toutes périodes)"
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
            {/* Period Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl mr-6 shadow-lg shadow-slate-200/40">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Analyse par période
                    </h2>
                    <p className="text-slate-600 font-medium">
                      Consultez les performances sur une période personnalisée
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
                  {/* Date de début */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-bold text-slate-700 tracking-wide uppercase">
                      <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm hover:bg-white"
                    />
                  </div>
                  {/* Date de fin */}
                  <div className="space-y-3">
                    <label className="flex items-center text-sm font-bold text-slate-700 tracking-wide uppercase">
                      <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 backdrop-blur-sm hover:bg-white"
                    />
                  </div>

                  {/* Bouton Analyser */}
                  <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                    <label className="text-sm font-bold text-slate-700 tracking-wide uppercase opacity-0 hidden lg:block">
                      Action
                    </label>
                    <button
                      onClick={fetchSaleDay}
                      disabled={periodSaleLoading}
                      className="group w-full px-6 py-4 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 flex items-center justify-center space-x-3 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {periodSaleLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="tracking-wide">Analyse...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="relative tracking-wide">
                            Analyser
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Résultat total */}
                  <div className="relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <SwissFranc className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-emerald-700 tracking-wide uppercase">
                        Montant total des ventes
                      </p>
                      <p className="text-3xl font-bold text-emerald-900 font-mono tracking-tight">
                        {formatCurrency(amountTotal)}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold">
                        sur la période sélectionnée
                      </p>
                    </div>
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

export default AdminDashboard;
