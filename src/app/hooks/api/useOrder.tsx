"use client"
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  OrderDto,
  OrderFilters,
  OrderStats,
} from "../../types/api/order.types";
import { useAuth } from "../../context/AuthContext";

import toast from "react-hot-toast";
import { OrderService } from "@/app/services/api/orderServices";
import {
  calculateOrderStats,
  validateOrderFilters,
} from "@/app/utils/orderUtil";

interface UseOrdersOptions {
  autoFetch?: boolean;
  defaultLimit?: number;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { autoFetch = true, defaultLimit = 10 } = options;

  // État principal
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // État des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dépendances
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Statistiques calculées
  const stats: OrderStats = useMemo(
    () => calculateOrderStats(orders),
    [orders]
  );

  /**
   * Récupère les commandes avec les filtres actuels
   */
  const fetchOrders = useCallback(
    async (page: number = 1, search: string = "", status: string = "ALL") => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const filters: OrderFilters = validateOrderFilters({
          page,
          limit: defaultLimit,
          search: search.trim(),
          status: status !== "ALL" ? (status as | "PENDING" | "COMPLETED"| "SHIPPED" | "DELIVERED"| "CANCELED") : "PENDING",
        });

        const response = await OrderService.getPaginated(tenantId, filters);

        setOrders(response.data || []);
        setTotalPages(response.totalPage || 1);
        setTotalOrders(response.total || 0);
        setCurrentPage(page);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des commandes";
        setError(message);
        setOrders([]);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, defaultLimit]
  );

  /**
   * Gère la recherche avec debounce
   */
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
  }, []);

  /**
   * Gère le changement de filtre de statut
   */
  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  /**
   * Gère le changement de page
   */
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
        setCurrentPage(page);
      }
    },
    [currentPage, totalPages, loading]
  );

  /**
   * Rafraîchit les données
   */
  const refresh = useCallback(() => {
    fetchOrders(currentPage, searchTerm, statusFilter);
  }, [fetchOrders, currentPage, searchTerm, statusFilter]);

  /**
   * Met à jour le statut d'une commande
   */
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
        await OrderService.updateStatus(orderId, newStatus);
        toast.success("Statut mis à jour avec succès");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour";
        toast.error(message);
        throw error;
      }
    },
    [refresh]
  );

  /**
   * Annule une commande
   */
  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await OrderService.cancel(orderId);
        toast.success("Commande annulée avec succès");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation";
        toast.error(message);
        throw error;
      }
    },
    [refresh]
  );

  /**
   * Confirme une commande
   */
  const confirmOrder = useCallback(
    async (orderId: string) => {
      try {
        await OrderService.confirm(orderId);
        toast.success("Commande confirmée avec succès");
        refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de la confirmation";
        toast.error(message);
        throw error;
      }
    },
    [refresh]
  );

  // Effet pour la recherche avec debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchOrders(1, searchTerm, statusFilter);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, fetchOrders]);

  // Effet pour le changement de page
  useEffect(() => {
    if (currentPage > 1) {
      fetchOrders(currentPage, searchTerm, statusFilter);
    }
  }, [currentPage, fetchOrders, searchTerm, statusFilter]);

  // Chargement initial
  useEffect(() => {
    if (autoFetch && tenantId) {
      fetchOrders(1, searchTerm, statusFilter);
    }
  }, [autoFetch, tenantId, fetchOrders, searchTerm, statusFilter]);

  return {
    // État
    orders,
    loading,
    error,

    // Pagination
    currentPage,
    totalPages,
    totalOrders,

    // Filtres
    searchTerm,
    statusFilter,

    // Statistiques
    stats,

    // Actions
    fetchOrders,
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
    refresh,
    updateOrderStatus,
    cancelOrder,
    confirmOrder,

    // Utilitaires
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isEmpty: orders.length === 0 && !loading,
    isFirstLoad: loading && orders.length === 0,
  };
};
