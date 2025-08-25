"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/app/prisma/api";
import { fournisseurDto } from "@/app/types/type";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/app/components/forms/Button";
import { handleBack } from "@/app/types/handleApi";
import { useAuth } from "@/app/context/AuthContext";
import { AxiosError } from "axios";

// Types et interfaces
interface ProvisioningFormData {
  name: string;
  supplierId: string;
  currentStock: string;
  newStock: string;
}

interface LoadingState {
  product: boolean;
  suppliers: boolean;
  submit: boolean;
}

interface ProductData {
  id: string;
  name: string;
  supplierId: string;
  stock: number;
  minStock?: number;
  maxStock?: number;
}

const INITIAL_FORM_DATA: ProvisioningFormData = {
  name: "",
  supplierId: "",
  currentStock: "",
  newStock: "",
};

const INITIAL_LOADING_STATE: LoadingState = {
  product: false,
  suppliers: false,
  submit: false,
};

export default function ProvisioningClient({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const tennantId = user?.tenantId;

  // États
  const [formData, setFormData] =
    useState<ProvisioningFormData>(INITIAL_FORM_DATA);
  const [suppliers, setSuppliers] = useState<fournisseurDto[]>([]);
  const [loading, setLoading] = useState<LoadingState>(INITIAL_LOADING_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Validation du formulaire
   */
  const validateForm = useCallback((): boolean => {
    if (!formData.supplierId) {
      setError("Veuillez sélectionner un fournisseur");
      return false;
    }

    const newStock = parseInt(formData.newStock, 10);
    if (isNaN(newStock) || newStock < 0) {
      setError("Le stock doit être un nombre positif ou égal à zéro");
      return false;
    }

    if (newStock > 10000) {
      setError("Le stock ne peut pas dépasser 10 000 unités");
      return false;
    }

    return true;
  }, [formData]);

  /**
   * Gestion des erreurs API améliorée
   */
  const handleApiError = useCallback(
    (error: unknown, context: string): void => {
      let errorMessage = "Une erreur inconnue est survenue";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          router.push("/login");
          return;
        }
        errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(`Erreur ${context}:`, error);
      setError(`${context}: ${errorMessage}`);
      toast.error(`Erreur ${context}`);
    },
    [router]
  );

  /**
   * Récupération des fournisseurs avec cache
   */
  const fetchSuppliers = useCallback(async (): Promise<void> => {
    setLoading((prev) => ({ ...prev, suppliers: true }));
    setError(null);
    try {
      if (!tennantId) {
        return;
      }
      const response = await api.get(`/supplier/${tennantId}`);
      setSuppliers(response.data);
    } catch (error) {
      handleApiError(error, "lors du chargement des fournisseurs");
    } finally {
      setLoading((prev) => ({ ...prev, suppliers: false }));
    }
  }, [handleApiError, tennantId]);

  /**
   * Récupération des données du produit
   */
  const fetchProduct = useCallback(
    async (id: string): Promise<void> => {
      setLoading((prev) => ({ ...prev, product: true }));
      setError(null);
      try {
        const response = await api.get(`/product/${id}`);
        const productData: ProductData = response.data;

        setFormData({
          name: productData.name || "",
          supplierId: productData.supplierId || "",
          currentStock: productData.stock?.toString() || "0",
          newStock: "",
        });
      } catch (error) {
        handleApiError(error, "lors du chargement du produit");
      } finally {
        setLoading((prev) => ({ ...prev, product: false }));
      }
    },
    [handleApiError]
  );

  /**
   * Chargement initial des données
   */
  useEffect(() => {
    if (!productId) {
      setError("ID du produit manquant");
      return;
    }

    const loadData = async () => {
      try {
        await fetchSuppliers();
        await fetchProduct(productId);
      } catch (error) {
        console.error("Erreur lors du chargement initial:", error);
      }
    };

    loadData();
  }, [productId, fetchProduct, fetchSuppliers]);

  /**
   * Gestion des changements dans le formulaire
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (error) setError(null);
      if (success) setSuccess(null);
    },
    [error, success]
  );

  /**
   * Soumission du formulaire
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await api.patch(`/product/provisioning/${productId}`, {
        supplierId: formData.supplierId,
        stock: parseInt(formData.newStock, 10),
      });

      console.log("Produit mis à jour:", response.data);
      const successMessage = `Produit "${formData.name}" approvisionné avec succès! Stock: ${formData.newStock} unités`;

      setSuccess(successMessage);
      toast.success(successMessage);

      setTimeout(() => {
        router.push("/products");
      }, 2000);
    } catch (error) {
      handleApiError(error, "lors de la mise à jour");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const getCurrentSupplierName = useCallback((): string => {
    if (!formData.supplierId) return "Aucun fournisseur sélectionné";
    const supplier = suppliers.find((sup) => sup.id === formData.supplierId);
    return supplier?.name || "Fournisseur inconnu";
  }, [formData.supplierId, suppliers]);

  const handleReset = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      newStock: "",
      supplierId: "",
    }));
    setError(null);
    setSuccess(null);
  }, []);

  const getStockDifference = useCallback((): number | null => {
    const current = parseInt(formData.currentStock, 10);
    const newStock = parseInt(formData.newStock, 10);

    if (isNaN(current) || isNaN(newStock)) return null;
    return newStock - current;
  }, [formData.currentStock, formData.newStock]);

  // --- Rendu ---
  if (loading.product && loading.suppliers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Chargement des données...
          </h2>
          <p className="text-gray-600">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  const stockDifference = getStockDifference();

  return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* En-tête amélioré */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestion d&apos;Approvisionnement
                  </h1>
                  <p className="text-gray-600">
                    Modifiez le fournisseur et gérez le stock du produit
                  </p>
                </div>
              </div>

              {formData.name && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
                  <h2 className="text-2xl font-bold text-orange-700 text-center">
                    {formData.name}
                  </h2>
                </div>
              )}
            </div>
            <div className="ml-6">
              <Button
                onClick={handleBack}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
                label={
                  <>
                    <ArrowLeft size={16} />
                    Retour
                  </>
                }
              />
            </div>
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Formulaire amélioré */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-800 to-orange-600 p-3">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Informations d&apos;approvisionnement
            </h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sélection du fournisseur */}
              <div className="space-y-2">
                <label
                  htmlFor="supplierId"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Fournisseur *
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  disabled={loading.suppliers}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                  required
                >
                  <option value="">
                    {loading.suppliers
                      ? "Chargement des fournisseurs..."
                      : "Sélectionnez un fournisseur"}
                  </option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {formData.supplierId && !loading.suppliers && (
                  <p className="text-sm text-orange-600 bg-blue-50 px-3 py-2 rounded-lg">
                    ✓ Fournisseur sélectionné:{" "}
                    <span className="font-semibold">
                      {getCurrentSupplierName()}
                    </span>
                  </p>
                )}
              </div>

              {/* Section Stock avec design en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock actuel */}
                <div className="space-y-2">
                  <label
                    htmlFor="currentStock"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Stock actuel
                  </label>
                  <div className="relative">
                    <input
                      id="currentStock"
                      name="currentStock"
                      type="number"
                      value={formData.currentStock}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed font-semibold"
                      placeholder="Stock actuel"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">unités</span>
                    </div>
                  </div>
                </div>

                {/* Nouveau stock */}
                <div className="space-y-2">
                  <label
                    htmlFor="newStock"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Nouveau stock *
                  </label>
                  <div className="relative">
                    <input
                      id="newStock"
                      name="newStock"
                      type="number"
                      min="0"
                      max="10000"
                      value={formData.newStock}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      placeholder="Entrez le nouveau stock"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-500">unités</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicateur de différence de stock */}
              {stockDifference !== null && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    stockDifference > 0
                      ? "bg-green-50 border-green-200 text-green-800"
                      : stockDifference < 0
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-gray-50 border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      className={`h-5 w-5 ${
                        stockDifference > 0
                          ? "text-green-600"
                          : stockDifference < 0
                          ? "text-red-600 rotate-180"
                          : "text-gray-600"
                      }`}
                    />
                    <span className="font-semibold">
                      {stockDifference > 0 &&
                        `+${stockDifference} unités (Augmentation)`}
                      {stockDifference < 0 &&
                        `${stockDifference} unités (Diminution)`}
                      {stockDifference === 0 && `Aucun changement de stock`}
                    </span>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    loading.submit || !formData.supplierId || !formData.newStock
                  }
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {loading.submit ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Mise à jour en cours...
                    </span>
                  ) : (
                    "Mettre à jour l'approvisionnement"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading.submit}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
