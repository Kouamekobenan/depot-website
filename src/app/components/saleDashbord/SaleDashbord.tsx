"use client";
import { useAuth } from "@/app/context/AuthContext";
import api, { formatDate } from "@/app/prisma/api";
import { directSaleDto } from "@/app/types/type";
import React, { useEffect, useState, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";
export default function SaleDashboard() {
  const [directSales, setDirectSales] = useState<directSaleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const date = new Date();
  const dateDay = formatDate(date);
  const tenantId = user?.tenantId;

  useEffect(() => {
    if (!tenantId) return;

    const fetchDirectSales = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/directeSale/tenant/${tenantId}`);
        if (Array.isArray(response.data?.data)) {
          setDirectSales(response.data.data);
        } else {
          throw new Error("Format de données invalide");
        }
      } catch (error) {
        console.error("Erreur du chargement des données", error);
        setError("Impossible de charger les données de vente");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectSales();
  }, [tenantId]);

  // Calculs des métriques
  const salesMetrics = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = directSales.filter(
      (sale) => new Date(sale.createdAt ).toDateString() === today
    );

    const totalDailyRevenue = todaySales.reduce(
      (sum, sale) => sum + Number(sale.totalPrice || 0),
      0
    );

    const totalRevenue = directSales.reduce(
      (sum, sale) => sum + Number(sale.totalPrice || 0),
      0
    );

    const averageOrderValue =
      directSales.length > 0 ? totalRevenue / directSales.length : 0;

    return {
      todayRevenue: totalDailyRevenue,
      totalRevenue,
      todaySalesCount: todaySales.length,
      totalSalesCount: directSales.length,
      averageOrderValue,
    };
  }, [directSales]);

  // Préparation des données pour le graphique
  const chartData = useMemo(() => {
    const salesByDate = directSales.reduce((acc, sale) => {
      const saleDate = new Date(sale.createdAt).toDateString();

      if (!acc[saleDate]) {
        acc[saleDate] = {
          revenue: 0,
          salesCount: 0,
          date: saleDate,
        };
      }

      acc[saleDate].revenue += Number(sale.totalPrice || 0);
      acc[saleDate].salesCount += 1;

      return acc;
    }, {} as Record<string, { revenue: number; salesCount: number; date: string }>);

    return Object.values(salesByDate)
      .map((item) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Derniers 30 jours
  }, [directSales]);

  // Calcul de la tendance
  const trendCalculation = useMemo(() => {
    if (chartData.length < 2) return { trend: 0, isPositive: true };

    const lastRevenue = chartData[chartData.length - 1]?.revenue || 0;
    const previousRevenue = chartData[chartData.length - 2]?.revenue || 0;

    if (previousRevenue === 0) return { trend: 0, isPositive: true };

    const trend = ((lastRevenue - previousRevenue) / previousRevenue) * 100;
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Erreur</div>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard des Ventes
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Données du {dateDay}
          </p>
        </div>
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Chiffre d'affaires du jour */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-300 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  trendCalculation.isPositive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {trendCalculation.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trendCalculation.trend.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">CA Journalier en (Fcfa)</p>
              <p className="text-2xl font-bold text-white">
                {salesMetrics.todayRevenue.toLocaleString()} 
              </p>
            </div>
          </div>
          {/* Ventes du jour */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-300 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">Ventes Aujourd&apos;hui</p>
              <p className="text-2xl font-bold text-white">
                {salesMetrics.todaySalesCount}
              </p>
            </div>
          </div>
          {/* Panier Moyen */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-300 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-sm">Panier Moyen</p>
              <p className="text-2xl font-bold text-white">
                {salesMetrics.averageOrderValue.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Évolution des Ventes
            </h2>
            <p className="text-slate-400 text-sm">
              Suivi quotidien du chiffre d&apos;affaires et du nombre de ventes
            </p>
          </div>

          {chartData.length > 0 ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "revenue"
                        ? `${value.toLocaleString()} FCFA`
                        : value,
                      name === "revenue"
                        ? "Chiffre d'affaires"
                        : "Nombre de ventes",
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="salesCount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    yAxisId="right"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">
                  Aucune donnée de vente disponible
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
