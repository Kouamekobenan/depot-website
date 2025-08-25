import React from "react";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { OrderStats } from "@/app/types/api/order.types";

interface OrderStatsCardsProps {
  stats: OrderStats;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  loading,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center">
      <div className="p-3 bg-orange-300 rounded-xl border-0">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {loading ? (
            <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  </div>
);

export const OrderStatsCards: React.FC<OrderStatsCardsProps> = ({
  stats,
  loading,
}) => {
  const statCards = [
    {
      title: "Total Commandes",
      value: stats.total,
      icon: Package,
    },
    {
      title: "En Attente",
      value: stats.pending,
      icon: Clock,
    },
    {
      title: "Confirmées",
      value: stats.completed,
      icon: CheckCircle,
    },
    {
      title: "Annulées",
      value: stats.canceled,
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {statCards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          loading={loading}
        />
      ))}
    </div>
  );
};
