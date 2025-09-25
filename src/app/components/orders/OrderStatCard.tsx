import React from "react";
import { Package, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { OrderStats } from "@/app/types/api/order.types";

interface OrderStatsCardsProps {
  stats: OrderStats;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  loading: boolean;
  gradient: string;
  bgColor: string;
  textColor: string;
  percentage?: number;
  trend?: "up" | "down" | "stable";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  loading,
  gradient,
  // bgColor,
  percentage,
  trend,
}) => (
  <div className="group relative">
    {/* Carte principale */}
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300">
      {/* Header avec icône */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
          <Icon className="w-7 h-7 text-white drop-shadow-sm" size={28} />
        </div>
        {percentage !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend === "up"
                ? "bg-emerald-100 text-emerald-700"
                : trend === "down"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <TrendingUp
              size={12}
              className={
                trend === "down"
                  ? "rotate-180"
                  : trend === "stable"
                  ? "rotate-90"
                  : ""
              }
            />
            {percentage}%
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-800 leading-none">
                  {value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">commandes</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Effet de brillance au hover */}
    <div
      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
      style={{
        transform: "translateX(-100%)",
        animation: "group-hover:shimmer 1.5s ease-in-out",
      }}
    />
  </div>
);

export const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({
  stats,
  loading,
}) => {
  // Calcul des pourcentages pour les tendances (simulation)
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const statCards = [
    {
      title: "Total Commandes",
      value: stats.total,
      icon: Package,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      percentage: 12,
      trend: "up" as const,
    },
    {
      title: "En Attente",
      value: stats.pending,
      icon: Clock,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
      bgColor: "bg-amber-500",
      textColor: "text-amber-600",
      percentage: calculatePercentage(stats.pending, stats.total),
      trend: "stable" as const,
    },
    {
      title: "Confirmées",
      value: stats.completed,
      icon: CheckCircle,
      gradient: "bg-gradient-to-br from-emerald-500 to-green-600",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-600",
      percentage: calculatePercentage(stats.completed, stats.total),
      trend: "up" as const,
    },
    {
      title: "Annulées",
      value: stats.canceled,
      icon: XCircle,
      gradient: "bg-gradient-to-br from-red-500 to-red-600",
      bgColor: "bg-red-500",
      textColor: "text-red-600",
      percentage: calculatePercentage(stats.canceled, stats.total),
      trend: stats.canceled > 0 ? ("down" as const) : ("stable" as const),
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Package size={24} className="text-slate-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Aperçu des Commandes
          </h2>
          <p className="text-slate-600">
            Vue d&apos;ensemble de l&apos;activité des commandes
          </p>
        </div>
      </div>

      {/* Grille des cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-fadeIn"
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              loading={loading}
              gradient={card.gradient}
              bgColor={card.bgColor}
              textColor={card.textColor}
              percentage={card.percentage}
              trend={card.trend}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
