"use client";
import { Button } from "@/app/components/forms/Button";
import { Card } from "@/app/components/forms/Card";
import Loader from "@/app/components/loader/Loder";
import Navbar from "@/app/components/navbar/Navbar";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/prisma/api";
import { SquarePen, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}
interface PaginatedResponse {
  data: Category[];
  total: number;
  totalPage: number;
  page: number;
  limit: number;
}
export default function PageCategorieClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse>(
        `/categories/paginate/${tenantId}`,
        {
          params: { limit, page },
        }
      );
      const result = response.data;
      if (Array.isArray(result.data)) {
        setCategories(result.data);
        setTotalPage(result.totalPage);
      } else {
        throw new Error("Format inattendu des données reçues.");
      }
    } catch (error: unknown) {
      handleApiError(error, "récupération des catégories");
    } finally {
      setLoading(false);
    }
  }, [page, tenantId]);

  const filterCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse>(
        `/categories/filter/${tenantId}`,
        {
          params: {
            name: searchTerm.trim(),
            limit,
            page,
          },
        }
      );
      const result = response.data;
      if (Array.isArray(result.data)) {
        setCategories(result.data);
        setTotalPage(result.totalPage);
      } else {
        throw new Error("Format inattendu des données reçues");
      }
    } catch (error: unknown) {
      handleApiError(error, "filtrage des catégories");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, tenantId]);
  const handleApiError = (error: unknown, context: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosError.response?.data?.message || `Erreur lors de la ${context}`
      );
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Erreur inconnue");
    }
  };
  useEffect(() => {
    if (searchTerm.trim()) {
      filterCategories();
    } else {
      fetchCategories();
    }
  }, [page, searchTerm, fetchCategories, filterCategories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await api.post("/categories", {
        name: newCategoryName.trim(),
        tenantId: tenantId,
      });

      setCategories((prev) => [res.data, ...prev]);
      setNewCategoryName("");
      setShowForm(false);
      toast.success("Catégorie enregistrée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout", error);
      toast.error("Échec de l'ajout de la catégorie");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirm = window.confirm(
      "Voulez-vous vraiment supprimer cette catégorie ?"
    );
    if (!confirm) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Catégorie supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression", error);
      toast.error("Échec de la suppression de la catégorie");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    try {
      const res = await api.patch(`/categories/${editingCategory.id}`, {
        name: editCategoryName.trim(),
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name: res.data.name } : cat
        )
      );

      toast.success("Catégorie modifiée avec succès !");
      setEditingCategory(null);
      setEditCategoryName("");
    } catch (error) {
      console.error("Erreur lors de la modification", error);
      toast.error("Échec de la modification de la catégorie");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
        <div className="my-2">
          <Card
            title="Catégories des produits"
            text="Rechercher une catégorie..."
            desc="Ajouter une catégorie"
            className="bg-green-600 text-white cursor-pointer hover:bg-green-700"
            onClick={() => setShowForm(!showForm)}
            onSearchClick={() => fetchCategories()}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />

          {/* Formulaire d'ajout responsive */}
          {showForm && (
            <aside className="flex flex-col sm:flex-row gap-2 sm:gap-3 my-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input text-base sm:text-xl flex-1 min-w-0"
                placeholder="Nom catégorie"
              />
              <div className="flex gap-2 sm:gap-3">
                <Button
                  label="Enregistrer"
                  onClick={handleAddCategory}
                  className="flex-1 sm:flex-none"
                />
                <Button
                  label="Fermer"
                  className="bg-orange-400 hover:bg-orange-300 flex-1 sm:flex-none"
                  onClick={() => setShowForm(false)}
                />
              </div>
            </aside>
          )}

          {/* Formulaire d'édition responsive */}
          {editingCategory && (
            <aside className="flex flex-col sm:flex-row gap-2 sm:gap-3 my-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="input text-base sm:text-xl flex-1 min-w-0"
                placeholder="Modifier nom catégorie"
              />
              <div className="flex gap-2 sm:gap-3">
                <Button
                  label="Modifier"
                  onClick={handleUpdateCategory}
                  className="flex-1 sm:flex-none"
                />
                <Button
                  label="Annuler"
                  className="bg-gray-400 hover:bg-gray-300 flex-1 sm:flex-none"
                  onClick={() => {
                    setEditingCategory(null);
                    setEditCategoryName("");
                  }}
                />
              </div>
            </aside>
          )}
        </div>

        {/* États de chargement et d'erreur */}
        {loading && <Loader message="Chargement des catégories..." />}
        {error && (
          <p className="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md mb-4 text-sm sm:text-base">
            {error}
          </p>
        )}

        {/* Message état vide */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {searchTerm
                ? "Aucune catégorie trouvée pour cette recherche."
                : "Aucune catégorie disponible."}
            </p>
          </div>
        )}

        {/* Liste des catégories responsive */}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-2 sm:space-y-3 mb-6">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
              >
                {/* Informations de la catégorie */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm sm:text-base font-medium truncate">
                    {cat.name}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 justify-end sm:justify-start">
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:rounded-full transition-all duration-200 text-red-600 dark:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setEditCategoryName(cat.name);
                    }}
                    className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:rounded-full transition-all duration-200 text-orange-600 dark:text-orange-400"
                    title="Modifier"
                  >
                    <SquarePen className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination responsive */}
        {!loading && !error && categories.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-6 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors text-sm sm:text-base"
            >
              Précédent
            </button>

            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              Page {page} sur {totalPage}
            </span>

            <button
              onClick={() => setPage((p) => (p < totalPage ? p + 1 : p))}
              disabled={page === totalPage}
              className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors text-sm sm:text-base"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
