"use client";
import { useState, useCallback, useEffect } from "react";
import { customerDto } from "../types/type";
import { useAuth } from "../context/AuthContext";
import api from "../prisma/api";
import toast from "react-hot-toast";

// Types stricts pour l'API
interface PaginationResponse {
  data: customerDto[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseCustomersReturn {
  customers: customerDto[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  deletingId: string | null;
  fetchCustomers: (page?: number) => Promise<void>;
  handleDeleteCustomer: (
    customerId: string,
    customerName: string
  ) => Promise<void>;
  handlePageChange: (page: number) => void;
}

export const useCustomers = (limit: number = 10): UseCustomersReturn => {
  const [customers, setCustomers] = useState<customerDto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuth();
  const tenantId: string | undefined = user?.tenantId;

  const fetchCustomers = useCallback(
    async (page: number = 1): Promise<void> => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get<PaginationResponse>(
          `/customer/paginate/${tenantId}`,
          {
            params: {
              page,
              limit,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setCustomers(response.data.data);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage || page);
          setTotalItems(response.data.totalItems || 0);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (error: unknown) {
        console.error("Erreur de chargement des clients:", error);
        toast.error("Erreur lors du chargement des clients");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, limit]
  );

  const handleDeleteCustomer = async (
    customerId: string,
    customerName: string
  ): Promise<void> => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le client "${customerName}" ?`
      )
    ) {
      return;
    }

    setDeletingId(customerId);
    try {
      await api.delete(`/customer/${customerId}`);
      toast.success(`Le client "${customerName}" a été supprimé avec succès!`);

      // Recharger la liste après suppression
      await fetchCustomers(currentPage);
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du client");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [fetchCustomers, currentPage]);

  return {
    customers,
    currentPage,
    totalPages,
    totalItems,
    loading,
    deletingId,
    fetchCustomers,
    handleDeleteCustomer,
    handlePageChange,
  };
};
