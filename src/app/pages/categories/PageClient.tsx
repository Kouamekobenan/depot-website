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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <div className="flex-1 p-6">
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
          {showForm && (
            <aside className="flex gap-3 my-2 items-center">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input text-xl"
                placeholder="Nom catégorie"
              />
              <Button label="Enregistrer" onClick={handleAddCategory} />
              <Button
                label="Fermer"
                className="bg-orange-400 hover:bg-orange-300"
                onClick={() => setShowForm(false)}
              />
            </aside>
          )}
          {editingCategory && (
            <aside className="flex gap-3 my-2 items-center bg-yellow-100 p-2 rounded">
              <input
                type="text"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="input text-xl"
                placeholder="Modifier nom catégorie"
              />
              <Button label="Modifier" onClick={handleUpdateCategory} />
              <Button
                label="Annuler"
                className="bg-gray-400 hover:bg-gray-300"
                onClick={() => {
                  setEditingCategory(null);
                  setEditCategoryName("");
                }}
              />
            </aside>
          )}
        </div>
        {loading && <Loader message="Chargement des catégories..." />}
        {error && (
          <p className="text-red-500 bg-red-100 dark:bg-orange-800 p-2 rounded-md mb-4">
            {error}
          </p>
        )}
        {!loading && !error && categories.length === 0 && (
          <p>
            {searchTerm
              ? "Aucune catégorie trouvée pour cette recherche."
              : "Aucune catégorie disponible."}
          </p>
        )}
        {!loading && !error && categories.length > 0 && (
          <ul className="space-y-2 mb-6">
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                className="p-3 flex justify-between bg-white dark:bg-gray-800 rounded-md shadow"
              >
                <aside className="flex gap-4">
                  <span>{i + 1}</span>
                  <span>{cat.name}</span>
                </aside>
                <aside className="flex gap-3">
                  <Trash2
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="cursor-pointer hover:bg-green-300 hover:rounded-full hover:p-1 transition text-green-600"
                  />
                  <SquarePen
                    onClick={() => {
                      setEditingCategory(cat);
                      setEditCategoryName(cat.name);
                    }}
                    className="cursor-pointer hover:bg-orange-300 hover:rounded-full hover:p-1 transition text-orange-600"
                  />
                </aside>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm">
            Page {page} / {totalPage}
          </span>
          <button
            onClick={() => setPage((p) => (p < totalPage ? p + 1 : p))}
            disabled={page === totalPage}
            className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
