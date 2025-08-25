import { Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import {
  OrderDto,
  OrderStatusConfig,
  OrderStats,
} from "../types/api/order.types";

interface filtreDto {
  status: "PENDING" | "COMPLETED" | "SHIPPED" | "DELIVERED" | "CANCELED";
  page: number;
  limit: number;
  search?: string;
  //   search?: string;
}
/**
 * Configuration des statuts avec leurs couleurs et icônes
 */
export const getStatusConfig = (status: string): OrderStatusConfig => {
  const statusConfigs: Record<string, OrderStatusConfig> = {
    PENDING: {
      icon: Clock,
      color: "text-amber-800 bg-amber-50 border-amber-200",
      label: "En attente",
      bgColor: "bg-amber-50",
    },
    COMPLETED: {
      icon: CheckCircle,
      color: "text-emerald-800 bg-emerald-50 border-emerald-200",
      label: "Confirmée",
      bgColor: "bg-emerald-50",
    },
    SHIPPED: {
      icon: Truck,
      color: "text-blue-800 bg-blue-50 border-blue-200",
      label: "Expédiée",
      bgColor: "bg-blue-50",
    },
    PAID: {
      icon: CheckCircle,
      color: "text-green-800 bg-green-50 border-green-200",
      label: "Payée",
      bgColor: "bg-green-50",
    },
    DELIVERED: {
      icon: CheckCircle,
      color: "text-green-800 bg-green-50 border-green-200",
      label: "Livrée",
      bgColor: "bg-green-50",
    },
    CANCELED: {
      icon: XCircle,
      color: "text-red-800 bg-red-50 border-red-200",
      label: "Annulée",
      bgColor: "bg-red-50",
    },
  };

  return statusConfigs[status] || statusConfigs.PENDING;
};

/**
 * Formate le prix en FCFA
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Formate une date
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

/**
 * Calcule les statistiques des commandes
 */
export const calculateOrderStats = (orders: OrderDto[]): OrderStats => {
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    canceled: orders.filter((o) => o.status === "CANCELED").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };
};

/**
 * Génère un ID court pour l'affichage
 */
export const generateShortId = (fullId: string): string => {
  return `#${fullId.slice(-8)}`;
};

/**
 * Valide les filtres de recherche
 */
export const validateOrderFilters = (filters: filtreDto) => {
  const validStatuses = [
    "ALL",
    "PENDING",
    "COMPLETED",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
  ];

  return {
    ...filters,
    status: validStatuses.includes(filters.status) ? filters.status : "ALL",
    page: Math.max(1, Number(filters.page) || 1),
    limit: Math.max(1, Math.min(100, Number(filters.limit) || 10)),
  };
};

/**
 * Détermine si une commande peut être modifiée
 */
export const canEditOrder = (status: string): boolean => {
  return ["PENDING"].includes(status);
};

/**
 * Détermine si une commande peut être annulée
 */
export const canCancelOrder = (status: string): boolean => {
  return ["PENDING", "COMPLETED"].includes(status);
};

/**
 * Options de statut pour les filtres
 */
export const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "COMPLETED", label: "Confirmées" },
  { value: "SHIPPED", label: "Expédiées" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELED", label: "Annulées" },
];
