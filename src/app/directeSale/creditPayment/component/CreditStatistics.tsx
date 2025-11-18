import React from "react";
import {
  CreditCard,
  SwissFranc,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface StatisticsData {
  totalCredits: number;
  totalAmount: number;
  totalPaid: number;
  totalDue: number;
}

const statCards = [
  {
    key: "totalCredits",
    label: "Total Crédits",
    icon: CreditCard,
    color: "bg-blue-500",
    value: (stats: StatisticsData) => stats.totalCredits,
    valueColor: "text-gray-900",
  },
  {
    key: "totalAmount",
    label: "Montant Total",
    icon: SwissFranc,
    color: "bg-orange-500",
    value: (stats: StatisticsData) => stats.totalAmount,
    valueColor: "text-gray-900",
    format: (v: number) => `${v.toLocaleString()} F`,
  },
  {
    key: "totalPaid",
    label: "Montant Payé",
    icon: CheckCircle2,
    color: "bg-green-500",
    value: (stats: StatisticsData) => stats.totalPaid,
    valueColor: "text-green-700",
    format: (v: number) => `${v.toLocaleString()} F`,
  },
  {
    key: "totalDue",
    label: "Reste à Payer",
    icon: AlertCircle,
    color: "bg-red-500",
    value: (stats: StatisticsData) => stats.totalDue,
    valueColor: "text-red-700",
    format: (v: number) => `${v.toLocaleString()} F`,
  },
];

const CreditStatistics: React.FC<{ statistics: StatisticsData }> = ({
  statistics,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => {
        const value = card.value(statistics);
        return (
          <div
            key={card.key}
            className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-700 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p
                  className={`text-3xl font-extrabold mt-1 ${card.valueColor}`}
                >
                  {card.format ? card.format(value) : value}
                </p>
              </div>
              <div
                className={`h-12 w-12 ${card.color} rounded-full flex items-center justify-center bg-opacity-90`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreditStatistics;
