"use client";

import { useAuth } from "@/app/context/AuthContext";
import {
  X,
  Plus,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface DeliveryProductInput {
  productId: string;
  quantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
}

interface FormDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (delivery: DeliveryData) => Promise<void>;
  isLoading?: boolean;
}

interface DeliveryData {
  deliveryPersonId: string;
  status: string;
  createdAt: Date;
  tenantId: string;
  deliveryProducts: DeliveryProductInput[];
}

// Type corrigé pour les erreurs de validation
interface ProductError {
  productId?: string;
  quantity?: string;
  deliveredQuantity?: string;
  returnedQuantity?: string;
}

interface ValidationErrors {
  deliveryPersonId?: string;
  products?: ProductError[]; // Tableau d'erreurs de produits
}

const DELIVERY_STATUSES = [
  { value: "PENDING", label: "En attente", color: "text-yellow-600" },
  { value: "IN_PROGRESS", label: "En cours", color: "text-blue-600" },
  { value: "COMPLETED", label: "Terminé", color: "text-green-600" },
] as const;

const FormDelivery: React.FC<FormDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [deliveryPersonId, setDeliveryPersonId] = useState("");
  const [status, setStatus] = useState<string>("PENDING");
  const [products, setProducts] = useState<DeliveryProductInput[]>([
    {
      productId: "",
      quantity: 0,
      deliveredQuantity: 0,
      returnedQuantity: 0,
    },
  ]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation du livreur
    if (!deliveryPersonId.trim()) {
      newErrors.deliveryPersonId = "Le livreur est requis";
    }

    // Validation des produits
    const productErrors: ProductError[] = [];
    let hasProductError = false;

    products.forEach((product, index) => {
      const productError: ProductError = {};

      if (!product.productId.trim()) {
        productError.productId = "ID produit requis";
        hasProductError = true;
      }
      if (product.quantity <= 0) {
        productError.quantity = "Quantité doit être > 0";
        hasProductError = true;
      }
      if (product.deliveredQuantity < 0) {
        productError.deliveredQuantity = "Quantité livrée doit être ≥ 0";
        hasProductError = true;
      }
      if (product.returnedQuantity < 0) {
        productError.returnedQuantity = "Quantité retournée doit être ≥ 0";
        hasProductError = true;
      }
      if (
        product.deliveredQuantity + product.returnedQuantity >
        product.quantity
      ) {
        productError.deliveredQuantity =
          "Livré + retourné ne peut pas dépasser la quantité";
        hasProductError = true;
      }

      productErrors[index] = productError;
    });

    if (hasProductError) {
      newErrors.products = productErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [deliveryPersonId, products]);

  const handleProductChange = useCallback(
    (
      index: number,
      field: keyof DeliveryProductInput,
      value: string | number
    ) => {
      const updated = [...products];
      updated[index] = {
        ...updated[index],
        [field]: field === "productId" ? String(value) : Number(value),
      };
      setProducts(updated);

      // Nettoyer les erreurs pour ce champ spécifique
      if (
        errors.products &&
        errors.products[index] &&
        errors.products[index][field]
      ) {
        const newErrors = { ...errors };
        if (newErrors.products && newErrors.products[index]) {
          const updatedProductErrors = [...newErrors.products];
          updatedProductErrors[index] = {
            ...updatedProductErrors[index],
            [field]: undefined,
          };
          newErrors.products = updatedProductErrors;
          setErrors(newErrors);
        }
      }
    },
    [products, errors]
  );

  const addProduct = useCallback(() => {
    setProducts((prev) => [
      ...prev,
      { productId: "", quantity: 0, deliveredQuantity: 0, returnedQuantity: 0 },
    ]);
  }, []);

  const removeProduct = useCallback(
    (index: number) => {
      if (products.length > 1) {
        setProducts((prev) => prev.filter((_, i) => i !== index));

        // Nettoyer les erreurs associées
        if (errors.products) {
          const updatedErrors = { ...errors };
          if (updatedErrors.products) {
            updatedErrors.products = updatedErrors.products.filter(
              (_, i) => i !== index
            );
            setErrors(updatedErrors);
          }
        }
      }
    },
    [products.length, errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryData: DeliveryData = {
        deliveryPersonId,
        status,
        tenantId: tenantId ?? "",
        createdAt: new Date(),
        deliveryProducts: products,
      };

      if (onSubmit) {
        await onSubmit(deliveryData);
      } else {
        console.log("Delivery submitted:", deliveryData);
      }

      // Réinitialiser le formulaire après succès
      setDeliveryPersonId("");
      setStatus("PENDING");
      setProducts([
        {
          productId: "",
          quantity: 0,
          deliveredQuantity: 0,
          returnedQuantity: 0,
        },
      ]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast.error("Erreur de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setDeliveryPersonId("");
    setStatus("PENDING");
    setProducts([
      {
        productId: "",
        quantity: 0,
        deliveredQuantity: 0,
        returnedQuantity: 0,
      },
    ]);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Truck className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              Créer une Livraison
            </h2>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={handleClose}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de livraison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livreur *
              </label>
              <input
                type="text"
                value={deliveryPersonId}
                onChange={(e) => {
                  setDeliveryPersonId(e.target.value);
                  if (errors.deliveryPersonId) {
                    setErrors((prev) => ({
                      ...prev,
                      deliveryPersonId: undefined,
                    }));
                  }
                }}
                placeholder="Identifiant du livreur"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.deliveryPersonId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting || isLoading}
              />
              {errors.deliveryPersonId && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.deliveryPersonId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isLoading}
              >
                {DELIVERY_STATUSES.map(({ value, label, color }) => (
                  <option key={value} value={value} className={color}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Produits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Package className="mr-2" size={20} />
                Produits
              </h3>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                disabled={isSubmitting || isLoading}
              >
                <Plus size={16} />
                <span>Ajouter un produit</span>
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">
                      Produit {index + 1}
                    </h4>
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                        disabled={isSubmitting || isLoading}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        ID Produit *
                      </label>
                      <input
                        type="text"
                        value={product.productId}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        placeholder="product-1"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.products?.[index]?.productId
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.products?.[index]?.productId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index]?.productId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Quantité demandée *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.products?.[index]?.quantity
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.products?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index]?.quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Quantité livrée
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={product.deliveredQuantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "deliveredQuantity",
                            Number(e.target.value)
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.products?.[index]?.deliveredQuantity
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.products?.[index]?.deliveredQuantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index]?.deliveredQuantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Quantité retournée
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={product.returnedQuantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "returnedQuantity",
                            Number(e.target.value)
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.products?.[index]?.returnedQuantity
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={isSubmitting || isLoading}
                      />
                      {errors.products?.[index]?.returnedQuantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index]?.returnedQuantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting || isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Validation...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Valider la livraison</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDelivery;
