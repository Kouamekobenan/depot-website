"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  AlertCircle,
  Trash2,
  Edit,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { productItems } from "@/app/types/type";
import { Button } from "../forms/Button";
import api from "@/app/prisma/api";
import Loader from "../loader/Loder";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
// Types et interfaces
interface PaginatedResponse {
  products: productItems[];
  data?: productItems[];
  total: number;
  totalPage: number;
  page: number;
  limit: number;
}
interface ProductFilters {
  name?: string;
  page: number;
  limit: number;
}
interface paginateItem {
  limit: number;
  page: number;
  name?: string;
}
// Configuration des constantes
const PRODUCTS_PER_PAGE = 5;
const DEBOUNCE_DELAY = 300;
// Hook personnalisé pour le debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Composant principal
export default function DataProduct() {
  // États
  const [products, setProducts] = useState<productItems[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(
    new Set()
  );

  const router = useRouter();
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);
  const tenantId = user?.tenantId;
  // Gestionnaire d'erreurs API amélioré
  const handleApiError = useCallback(
    (error: unknown, context: string): string => {
      console.error(`Erreur ${context}:`, error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };
        const status = axiosError.response?.status;
        const message = axiosError.response?.data?.message;

        if (status === 404) return "Ressource non trouvée";
        if (status === 403) return "Accès non autorisé";
        if (status === 500) return "Erreur serveur, veuillez réessayer";

        return message || `Erreur lors de la ${context}`;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return "Une erreur inattendue s'est produite";
    },
    []
  );

  // Fonction pour récupérer les produits avec filtre
  const fetchProducts = useCallback(
    async (filter: ProductFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = filter.name?.trim()
          ? `/product/filter/${tenantId}`
          : `/product/paginate/${tenantId}`;
        const params: paginateItem = {
          page: filter.page,
          limit: filter.limit,
        };

        if (filter.name?.trim()) {
          params.name = filter.name.trim();
        }

        const response = await api.get<PaginatedResponse>(endpoint, { params });

        if (!response.data) {
          throw new Error("Réponse vide du serveur");
        }

        let fetchedProducts: productItems[];
        let totalPage: number;

        if (response.data.products !== undefined) {
          fetchedProducts = response.data.products;
          totalPage = response.data.totalPage;
        } else if (response.data.data !== undefined) {
          fetchedProducts = response.data.data;
          totalPage = response.data.totalPage;
        } else if (Array.isArray(response.data)) {
          fetchedProducts = response.data;
          totalPage = 1;
        } else {
          fetchedProducts = [];
          totalPage = 1;
        }

        if (!Array.isArray(fetchedProducts)) {
          throw new Error(
            `Format de données invalide: attendu un tableau, reçu ${typeof fetchedProducts}`
          );
        }

        setProducts(fetchedProducts);
        setTotalPages(totalPage || 1);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération:", error);
        const errorMessage = handleApiError(error, "récupération des produits");
        setError(errorMessage);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiError, tenantId]
  );

  // Fonction pour supprimer un produit unique
  const handleDeleteProduct = async (id: string) => {
    setDeletingProducts((prev) => new Set(prev.add(id)));
    try {
      await api.delete(`/product/${id}`);
      toast.success("Produit supprimé avec succès!");
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error: unknown) {
      console.log("Échec de la suppression du produit", error);
      toast.error("Erreur lors de la suppression du produit");
    } finally {
      setDeletingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  // Effet pour charger les produits
  useEffect(() => {
    const filters: ProductFilters = {
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
    };

    if (debouncedSearchTerm.trim()) {
      filters.name = debouncedSearchTerm.trim();
    }

    fetchProducts(filters);
  }, [currentPage, debouncedSearchTerm, fetchProducts]);

  // Réinitialiser la page lors de la recherche
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm, currentPage]);

  // Gestionnaires d'événements
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const navigateToCategories = useCallback(() => {
    router.push("/pages/categories");
  }, [router]);

  const navigateToAddProduct = useCallback(() => {
    router.push("/products/add");
  }, [router]);

  // Composant d'en-tête du tableau
  const TableHeader = () => (
    <div className="grid grid-cols-6 bg-gradient-to-r from-orange-50 to-green-50 px-6 py-4 font-semibold text-gray-700 text-sm border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Package size={16} className="text-orange-600" />
        Nom du produit
      </div>
      <div>Description</div>
      <div className="text-center">Stock disponible</div>
      <div className="text-right">Prix d&apos;achat (Fcfa)</div>
      <div className="text-right">Prix de vente(Fcfa)</div>
      <div className="text-center">Actions</div>
    </div>
  );

  // Composant ligne de produit
  const ProductRow = ({ product }: { product: productItems }) => {
    const isDeleting = deletingProducts.has(product.id);
    const isLowStock = product.stock < 10;
    return (
      <div className="grid grid-cols-6 items-center px-6 py-4 bg-white border-b border-gray-100 hover:bg-orange-50/30 transition-all duration-200">
        <div
          className="font-medium text-gray-900 truncate"
          title={product.name}
        >
          {product.name}
        </div>
        <div
          className="text-gray-600 text-sm truncate"
          title={product.description || ""}
        >
          {product.description || "—"}
        </div>
        <div className="text-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isLowStock
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {product.stock}
            {isLowStock && <AlertCircle size={14} className="ml-1" />}
          </span>
        </div>
        <div className="text-center font-semibold text-gray-900">
          {product.purchasePrice.toLocaleString()}
        </div>
        <div className="text-center font-semibold text-green-700">
          {product.price.toLocaleString()}
        </div>
        <div className="flex items-center justify-center gap-2">
          {user?.role === "MANAGER" && (
            <>
              <Link
                href={`/products/add?id=${product.id}`}
                className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 group"
                title="Modifier le produit"
              >
                <Edit
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              </Link>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Supprimer le produit"
              >
                {isDeleting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" />
                ) : (
                  <Trash2
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
              </button>
              <Link
                href={`/products/provisionning/${product.id}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md"
                title="Réapprovisionner"
              >
                <ShoppingCart size={12} />
                Achat
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };
  // Composant de pagination
  const Pagination = () => (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-600">
        {products.length > 0 && (
          <>
            Affichage de{" "}
            <span className="font-semibold">
              {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
            </span>{" "}
            à{" "}
            <span className="font-semibold">
              {Math.min(currentPage * PRODUCTS_PER_PAGE, products.length)}
            </span>{" "}
            sur <span className="font-semibold">{products.length}</span>{" "}
            produits
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Précédent
        </button>

        <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
          Page {currentPage} sur {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Suivant
        </button>
      </div>
    </div>
  );
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête avec recherche et actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Package className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestion des produits
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez votre inventaire et suivez vos stocks
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <Button
                label="Catégories"
                className="bg-green-600 hover:bg-green-700 text-white border-0 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                onClick={navigateToCategories}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Tableau des produits */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <TableHeader />
        {isLoading ? (
          <div className="p-12">
            <Loader message="Chargement des produits..." />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="text-red-500" size={48} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
              </div>
              <button
                onClick={() =>
                  fetchProducts({ page: currentPage, limit: PRODUCTS_PER_PAGE })
                }
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Package className="text-gray-400" size={48} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm
                    ? "Aucun résultat trouvé"
                    : "Aucun produit disponible"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? `Aucun produit ne correspond à "${searchTerm}"`
                    : "Commencez par ajouter des produits à votre inventaire"}
                </p>
              </div>
              {!searchTerm && (
                <button
                  onClick={navigateToAddProduct}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  Ajouter votre premier produit
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && <Pagination />}
      </div>
    </div>
  );
}
