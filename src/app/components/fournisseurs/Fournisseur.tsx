"use client";

import React, { useCallback, useEffect, useState } from "react";
import { SquarePen, Trash2, AlertCircle, Users } from "lucide-react";
import toast from "react-hot-toast";

import api from "@/app/prisma/api";
import { fournisseurDto } from "@/app/types/type";
import { useAuth } from "@/app/context/AuthContext";
import Loader from "../loader/Loder";
import { FormFourn } from "./FormFourn";

// Types pour une meilleure structure
interface FournisseurState {
  data: fournisseurDto[];
  selectedFournisseur: fournisseurDto | null;
  isModalOpen: boolean;
  loading: boolean;
  error: string | null;
}

// Configuration des colonnes pour plus de maintenabilité
const TABLE_COLUMNS = [
  { key: "name", label: "Nom", width: "col-span-3" },
  { key: "email", label: "Email", width: "col-span-3" },
  { key: "phone", label: "Téléphone", width: "col-span-3" },
  {
    key: "actions",
    label: "Actions",
    width: "col-span-3",
    align: "text-right",
  },
] as const;

export default function Fournisseur() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // État consolidé pour une meilleure gestion
  const [state, setState] = useState<FournisseurState>({
    data: [],
    selectedFournisseur: null,
    isModalOpen: false,
    loading: true,
    error: null,
  });

  // Fonction de récupération des fournisseurs avec gestion d'erreur améliorée
  const fetchSuppliers = useCallback(async (): Promise<void> => {
    if (!tenantId) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Identifiant tenant non trouvé",
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await api.get(`/supplier/${tenantId}`);
      const { data } = response;

      if (!Array.isArray(data)) {
        throw new Error("Format inattendu des données reçues.");
      }

      setState((prev) => ({
        ...prev,
        data,
        loading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors du chargement des fournisseurs.";

      console.error("Erreur lors du chargement des fournisseurs :", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Gestion de la suppression avec confirmation améliorée
  const handleDelete = useCallback(
    async (id: string, name: string): Promise<void> => {
      const isConfirmed = window.confirm(
        `Voulez-vous vraiment supprimer le fournisseur "${name}" ?\nCette action est irréversible.`
      );

      if (!isConfirmed) return;

      try {
        await api.delete(`/supplier/${id}`);

        setState((prev) => ({
          ...prev,
          data: prev.data.filter((supplier) => supplier.id !== id),
        }));

        toast.success(`Fournisseur "${name}" supprimé avec succès !`);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        toast.error("Échec de la suppression du fournisseur");
      }
    },
    []
  );

  // Gestion de l'édition
  const handleEdit = useCallback((fournisseur: fournisseurDto): void => {
    setState((prev) => ({
      ...prev,
      selectedFournisseur: fournisseur,
      isModalOpen: true,
    }));
  }, []);

  // Gestion du succès de l'opération
  const handleOperationSuccess = useCallback((): void => {
    fetchSuppliers();
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedFournisseur: null,
    }));
  }, [fetchSuppliers]);

  // Fermeture du modal
  const handleModalClose = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      selectedFournisseur: null,
    }));
  }, []);

  // Composant pour l'en-tête du tableau
  const TableHeader = () => (
    <header className="grid grid-cols-12 gap-4 font-semibold bg-gradient-to-r from-orange-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 px-6 py-4 rounded-lg text-blue-900 dark:text-gray-200 text-sm border border-blue-100 dark:border-gray-600">
      {TABLE_COLUMNS.map((column) => (
        <div
          key={column.key}
          className={`${column.width} ${"text-left"}`}
        >
          {column.label}
        </div>
      ))}
    </header>
  );

  // Composant pour une ligne de fournisseur
  const SupplierRow = ({
    supplier,
    index,
  }: {
    supplier: fournisseurDto;
    index: number;
  }) => (
    <article className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-lg text-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 group">
      <div className="col-span-3 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 bg-orange-300 dark:bg-gray-700 text-orange-600 text-white rounded-full text-xs font-medium">
          {index + 1}
        </span>
        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {supplier.name}
        </span>
      </div>
      <div className="col-span-3 text-gray-600 dark:text-gray-400 truncate">
        {supplier.email}
      </div>

      <div className="col-span-3 text-gray-600 dark:text-gray-400">
        {supplier.phone}
      </div>

      <div className="col-span-3 flex justify-end gap-2">
        <button
          onClick={() => handleEdit(supplier)}
          className="flex items-center justify-center w-9 h-9 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-all duration-200 group-hover:scale-105"
          aria-label={`Modifier ${supplier.name}`}
          title="Modifier"
        >
          <SquarePen size={16} />
        </button>

        <button
          onClick={() => handleDelete(supplier.id, supplier.name)}
          className="flex items-center justify-center w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 group-hover:scale-105"
          aria-label={`Supprimer ${supplier.name}`}
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );

  // Composant pour l'état vide
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <Users className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
        Aucun fournisseur trouvé
      </h3>
      <p className="text-gray-500 dark:text-gray-500 max-w-md">
        Commencez par ajouter votre premier fournisseur pour gérer vos relations
        commerciales.
      </p>
    </div>
  );

  // Composant pour l'état d'erreur
  const ErrorState = ({ error }: { error: string }) => (
    <div className="flex items-center justify-center gap-3 p-6 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-500" />
      <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
    </div>
  );

  // Rendu principal
  return (
    <main
      className="w-full space-y-6"
      role="main"
      aria-label="Gestion des fournisseurs"
    >
      <TableHeader />

      <section className="space-y-3" aria-label="Liste des fournisseurs">
        {state.loading ? (
          <Loader message="Chargement des fournisseurs..." />
        ) : state.error ? (
          <ErrorState error={state.error} />
        ) : state.data.length === 0 ? (
          <EmptyState />
        ) : (
          state.data.map((supplier, index) => (
            <SupplierRow key={supplier.id} supplier={supplier} index={index} />
          ))
        )}
      </section>

      {/* Modal de formulaire */}
      <FormFourn
        isOpen={state.isModalOpen}
        onClose={handleModalClose}
        mode="edit"
        existingFournisseur={state.selectedFournisseur}
        onSuccess={handleOperationSuccess}
      />
    </main>
  );
}
