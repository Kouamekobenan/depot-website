"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { deliveryDto } from "@/app/types/type";
import api from "@/app/prisma/api";
import Navbar from "@/app/components/navbar/Navbar";
import { useAuth } from "@/app/context/AuthContext";
import { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

// Constantes
const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

// Types
interface DailyStats {
  quantity: number;
  amount: number;
}
interface ChartDataPoint {
  date: string;
  quantity: number;
  amount: number;
}
interface MonthlyStats {
  totalQuantity: number;
  totalAmount: number;
  totalDeliveries: number;
  averagePerDay: number;
}
interface DeliveryPerson {
  id: string;
  name: string;
}

export default function DeliveryStatsClient({
  deliveryPersonId,
}: {
  deliveryPersonId: string;
}) {
  const [deliveries, setDeliveries] = useState<deliveryDto[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>(
    deliveryPersonId || ""
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Fetch livraisons
  const fetchDeliveries = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/delivery/tenant/${tenantId}`);
      if (response.data && Array.isArray(response.data)) {
        setDeliveries(response.data);

        if (!deliveryPersonId && response.data.length > 0) {
          const firstDelivery = response.data.find((d) => d.deliveryPersonId);
          if (firstDelivery) {
            setSelectedPerson(firstDelivery.deliveryPersonId);
          }
        }
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des livraisons:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [tenantId, deliveryPersonId]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Liste unique des livreurs
  const uniqueDeliveryPersons = useMemo((): DeliveryPerson[] => {
    const personMap = new Map<string, DeliveryPerson>();
    deliveries.forEach((delivery) => {
      if (delivery.deliveryPerson && delivery.deliveryPersonId) {
        personMap.set(delivery.deliveryPersonId, {
          id: delivery.deliveryPersonId,
          name: delivery.deliveryPerson.name || "Nom inconnu",
        });
      }
    });
    return Array.from(personMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [deliveries]);

  // Statistiques
  const { chartData, monthlyStats } = useMemo(() => {
    const filteredDeliveries = deliveries
      .map((delivery) => ({
        ...delivery,
        createdAt: new Date(delivery.createdAt),
      }))
      .filter((delivery) => {
        const deliveryDate = delivery.createdAt;
        return (
          delivery.deliveryPersonId === selectedPerson &&
          deliveryDate.getMonth() === selectedMonth &&
          deliveryDate.getFullYear() === selectedYear &&
          !isNaN(deliveryDate.getTime())
        );
      });

    const dailyTotals: Record<string, DailyStats> = {};
    let totalQuantity = 0;
    let totalAmount = 0;

    filteredDeliveries.forEach((delivery) => {
      const dateKey = format(delivery.createdAt, "yyyy-MM-dd");

      const deliveredQuantity =
        delivery.deliveryProducts?.reduce(
          (sum, dp) => sum + (Number(dp.deliveredQuantity) || 0),
          0
        ) || 0;

      const deliveredAmount =
        delivery.deliveryProducts?.reduce((sum, dp) => {
          const quantity = Number(dp.deliveredQuantity) || 0;
          const price = Number(dp.product?.price) || 0;
          return sum + quantity * price;
        }, 0) || 0;

      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = { quantity: 0, amount: 0 };
      }

      dailyTotals[dateKey].quantity += deliveredQuantity;
      dailyTotals[dateKey].amount += deliveredAmount;

      totalQuantity += deliveredQuantity;
      totalAmount += deliveredAmount;
    });

    const chartData: ChartDataPoint[] = Object.entries(dailyTotals)
      .map(([date, { quantity, amount }]) => ({
        date: format(new Date(date), "dd/MM"),
        quantity: Math.round(quantity),
        amount: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => {
        const dateA = new Date(
          `${selectedYear}-${selectedMonth + 1}-${a.date.split("/")[0]}`
        );
        const dateB = new Date(
          `${selectedYear}-${selectedMonth + 1}-${b.date.split("/")[0]}`
        );
        return dateA.getTime() - dateB.getTime();
      });

    const monthlyStats: MonthlyStats = {
      totalQuantity: Math.round(totalQuantity),
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalDeliveries: filteredDeliveries.length,
      averagePerDay:
        chartData.length > 0
          ? Math.round((totalAmount / chartData.length) * 100) / 100
          : 0,
    };

    return { chartData, monthlyStats };
  }, [selectedPerson, selectedMonth, selectedYear, deliveries]);

  // Années disponibles
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    deliveries.forEach((delivery) => {
      const year = new Date(delivery.createdAt).getFullYear();
      if (!isNaN(year)) years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [deliveries]);

  // Tooltip custom
  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{`Date: ${label}`}</p>
          <p className="text-orange-600 font-medium">
            Quantité: {payload[0]?.value || 0} unités
          </p>
          <p className="text-green-600 font-medium">
            Montant: {payload[1]?.value || 0} FCFA
          </p>
        </div>
      );
    }
    return null;
  };

  // --- UI ---
  if (loading) {
    return (
      <div className="w-full flex">
        <Navbar />
        <div className="flex-1 p-4 flex justify-center items-center h-96">
          <div className="text-xl font-semibold text-gray-600">
            Chargement...
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full flex">
        <Navbar />
        <div className="flex-1 p-4 flex justify-center items-center h-96">
          <div className="text-xl font-semibold text-red-600">
            {error}
            <button
              onClick={fetchDeliveries}
              className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Performance des livreurs en{" "}
            <span className="text-orange-500">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <select
              className="border-2 border-gray-300 p-3 rounded-lg text-orange-600 font-semibold focus:border-orange-500 focus:outline-none min-w-[200px]"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              disabled={uniqueDeliveryPersons.length === 0}
            >
              {uniqueDeliveryPersons.length === 0 ? (
                <option value="">Aucun livreur disponible</option>
              ) : (
                uniqueDeliveryPersons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))
              )}
            </select>
            <select
              className="border-2 border-gray-300 p-3 rounded-lg text-gray-700 font-semibold focus:border-orange-500 focus:outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              className="border-2 border-gray-300 p-3 rounded-lg text-gray-700 font-semibold focus:border-orange-500 focus:outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.length === 0 ? (
                <option value={new Date().getFullYear()}>
                  {new Date().getFullYear()}
                </option>
              ) : (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              )}
            </select>
          </div>
          {/* Statistiques mensuelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border-l-4 border-gray-950 shadow-md">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Total Livraisons
              </h3>
              <p className="text-xl font-bold text-gray-900 mt-2">
                {monthlyStats.totalDeliveries.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-md">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Quantité Totale
              </h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {monthlyStats.totalQuantity.toLocaleString()}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-md">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Montant Total
              </h3>
              <p className="text-xl font-bold text-green-600 mt-2">
                {monthlyStats.totalAmount.toLocaleString()} FCFA
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 shadow-md">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Moyenne/Jour
              </h3>
              <p className="text-xl font-bold text-purple-600 mt-2">
                {monthlyStats.averagePerDay.toLocaleString()} FCFA
              </p>
            </div>
          </div>
          {/* Graphique ou message d'absence de données */}
          {chartData.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border-2 border-dashed border-gray-300 text-center shadow-md">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-xl font-semibold text-gray-600 mb-2">
                Aucune donnée disponible
              </p>
              <p className="text-gray-500">
                Aucune livraison trouvée pour ce livreur durant{" "}
                {MONTHS[selectedMonth]} {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Évolution quotidienne - Quantités et Montants
              </h3>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Quantité",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Montant (FCFA)",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="quantity"
                    fill="#f59e0b"
                    name="Quantité"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="amount"
                    fill="#10b981"
                    name="Montant (FCFA)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
