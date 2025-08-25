// app/products/add/ProductFormContent.tsx
"use client";
import { Button } from "@/app/components/forms/Button";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  Save,
  Edit3,
  AlertCircle,
  CheckCircle,
  Contact,
} from "lucide-react";
import { Category, fournisseurDto } from "@/app/types/type";
import api from "@/app/prisma/api";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

// Interface pour les données du formulaire
interface FormData {
  name: string;
  description: string;
  price: string;
  criticalStockThreshold: string;
  purchasePrice: string;
  stock: string;
  supplierId: string;
  categoryProductId: string;
}

// Interface pour les erreurs
interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  criticalStockThreshold?: string;
  purchasePrice?: string;
  stock?: string;
  supplierId?: string;
  categoryProductId?: string;
}

// Type pour le statut de soumission
type SubmitStatus = "success" | "error" | null;

// Interface pour les props du composant InputField
interface InputFieldProps {
  label: string;
  name: keyof FormData;
  type?: string;
  placeholder: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  min?: string;
  step?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

// Composant InputField déplacé à l'extérieur pour éviter la re-création
const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  ...props
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {Icon && <Icon size={16} className="text-gray-500" />}
      {label}
      <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={false}
        autoComplete="off"
        className={`
          w-full border-2 px-4 py-3 rounded-lg transition-all duration-200
          focus:outline-none focus:ring-0 bg-gray-50 focus:bg-white
          ${
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-orange-500"
          }
        `}
        {...props}
      />
      {error && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AlertCircle size={20} className="text-red-500" />
        </div>
      )}
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

export default function ProductFormContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id"); // Pour récupérer l'ID du produit à modifier
  const isEditMode = Boolean(productId); // Détermine si on est en mode édition

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    criticalStockThreshold: "",
    purchasePrice: "",
    stock: "",
    categoryProductId: "",
    supplierId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [suppliers, setSuppliers] = useState<fournisseurDto[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode); // Loading pour le chargement initial du produit
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const limitPage: number = 50;

  // Fonction pour charger les données du produit en mode édition
  const fetchProductData = useCallback(
    async (id: string): Promise<void> => {
      try {
        setInitialLoading(true);
        const response = await api.get(`/product/${id}`);
        const product = response.data;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product?.price.toString() || "",
          criticalStockThreshold:
            product?.criticalStockThreshold.toString() || "",
          purchasePrice: product.purchasePrice?.toString() || "",
          stock: product.stock?.toString() || "",
          categoryProductId: product.categoryProductId || "",
          supplierId: product.supplierId || "",
        });
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
        toast.error("Erreur lors du chargement du produit");
        router.push("/products"); // Rediriger en cas d'erreur
      } finally {
        setInitialLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        const response = await api.get(`/categories/paginate/${tenantId}`, {
          params: {
            page: 1,
            limit: limitPage,
          },
        });
        const cat = response.data;
        if (Array.isArray(cat.data)) {
          setCategories(cat.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Erreur lors du chargement des catégories");
      }
    };

    const fetchSuppliers = async (): Promise<void> => {
      try {
        const response = await api.get(`/supplier/${tenantId}`);
        setSuppliers(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des fournisseurs:", error);
        toast.error("Erreur lors du chargement des fournisseurs");
      }
    };

    const initializeData = async (): Promise<void> => {
      await Promise.all([fetchCategories(), fetchSuppliers()]);

      // Charger les données du produit si on est en mode édition
      if (isEditMode && productId) {
        await fetchProductData(productId);
      }
    };

    initializeData();
  }, [isEditMode, productId, router, tenantId, fetchProductData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Le nom du produit est requis";
    if (!formData.description.trim())
      newErrors.description = "La description est requise";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Prix de vente invalide";
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0)
      newErrors.purchasePrice = "Prix d'achat invalide";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Stock invalide";
    if (
      !formData.criticalStockThreshold ||
      parseInt(formData.criticalStockThreshold) < 0
    )
      newErrors.criticalStockThreshold = "Seuil de stock faible invalide";
    if (!formData.categoryProductId)
      newErrors.categoryProductId = "Veuillez sélectionner une catégorie";
    if (!formData.supplierId)
      newErrors.supplierId = "Veuillez sélectionner un fournisseur";

    // Business logic validation
    if (
      formData.price &&
      formData.purchasePrice &&
      parseFloat(formData.price) <= parseFloat(formData.purchasePrice)
    ) {
      newErrors.price = "Le prix de vente doit être supérieur au prix d'achat";
    }

    // Validation du seuil de stock
    if (
      formData.stock &&
      formData.criticalStockThreshold &&
      parseInt(formData.criticalStockThreshold) >= parseInt(formData.stock)
    ) {
      newErrors.criticalStockThreshold =
        "Le seuil doit être inférieur au stock initial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Préparer les données avec les bons types
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100) / 100,
        purchasePrice:
          Math.round(parseFloat(formData.purchasePrice) * 100) / 100,
        criticalStockThreshold: parseInt(formData.criticalStockThreshold),
        stock: parseInt(formData.stock),
        supplierId: formData.supplierId,
        categoryProductId: formData.categoryProductId,
        tenantId: tenantId,
      };
      console.log("Données envoyées à l'API:", productData);

      let response;
      if (isEditMode && productId) {
        // Mode modification
        response = await api.put(`/product/${productId}`, productData);
        console.log("Produit modifié:", response.data);
        toast.success("Produit modifié avec succès!");
      } else {
        // Mode création
        response = await api.post(`/product/tenant/${tenantId}`, productData);
        console.log("Produit créé:", response.data);
        toast.success("Produit ajouté avec succès!");
      }
      setSubmitStatus("success");
      // Reset form seulement en mode création
      if (!isEditMode) {
        setFormData({
          name: "",
          description: "",
          price: "",
          purchasePrice: "",
          criticalStockThreshold: "",
          stock: "",
          categoryProductId: "",
          supplierId: "",
        });
      }

      // Rediriger vers la liste des produits après un délai
      setTimeout(() => {
        router.push("/products");
      }, 1500);
    } catch (error: unknown) {
      setSubmitStatus("error");
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const errorMessage = isEditMode
          ? "Erreur lors de la modification du produit"
          : "Erreur lors de la création du produit";
        toast.error(axiosError.response?.data?.message || errorMessage);
      } else {
        toast.error("Erreur inconnue");
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const profitMargin: string | number =
    formData.price && formData.purchasePrice
      ? (
          ((parseFloat(formData.price) - parseFloat(formData.purchasePrice)) /
            parseFloat(formData.purchasePrice)) *
          100
        ).toFixed(1)
      : 0;

  // Afficher un loader pendant le chargement initial du produit
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg text-gray-600">
                Chargement du produit...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto mt-8 mb-8">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm border-b-2 border-orange-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="text-orange-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Modification de produit" : "Ajout de produit"}
              </h1>
              <p className="text-gray-600">
                {isEditMode
                  ? "Modifiez les informations de ce produit"
                  : "Créez un nouveau produit dans votre inventaire"}
              </p>
            </div>
          </div>
          <Link href="/products">
            <Button
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              label={
                <>
                  <ArrowLeft size={16} />
                  Retour
                </>
              }
            />
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-b-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Informations générales
              </h3>
              <div className="space-y-4">
                <InputField
                  label="Nom du produit"
                  name="name"
                  placeholder="Ex: Coca-Cola 33cl"
                  icon={Package}
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText size={16} className="text-gray-500" />
                    Description
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Boisson gazeuse rafraîchissante au cola"
                    rows={3}
                    disabled={false}
                    autoComplete="off"
                    className={`
                      w-full border-2 px-4 py-3 rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-0 bg-gray-50 focus:bg-white resize-none
                      ${
                        errors.description
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-orange-500"
                      }
                    `}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Tag size={20} />
                Classification
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Tag size={16} className="text-gray-500" />
                    Catégorie
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryProductId"
                    value={formData.categoryProductId}
                    onChange={handleInputChange}
                    disabled={false}
                    className={`
                      w-full border-2 px-4 py-3 rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-0 bg-gray-50 focus:bg-white
                      ${
                        errors.categoryProductId
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-orange-500"
                      }
                    `}
                  >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryProductId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.categoryProductId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Contact size={16} className="text-gray-500" />
                    Fournisseur
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    disabled={false}
                    className={`
                      w-full border-2 px-4 py-3 rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-0 bg-gray-50 focus:bg-white
                      ${
                        errors.supplierId
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-orange-500"
                      }
                    `}
                  >
                    <option value="">-- Sélectionner un fournisseur --</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.supplierId}
                    </p>
                  )}
                </div>
                <InputField
                  label="Stock initial"
                  name="stock"
                  type="number"
                  placeholder="Ex: 50"
                  icon={Hash}
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  error={errors.stock}
                />
                <InputField
                  label="Seuil de stock faible"
                  name="criticalStockThreshold"
                  type="number"
                  placeholder="Ex: 10"
                  icon={AlertCircle}
                  min="0"
                  value={formData.criticalStockThreshold}
                  onChange={handleInputChange}
                  error={errors.criticalStockThreshold}
                />
              </div>
            </div>
          </div>
          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Informations tarifaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Prix d'achat (FCFA)"
                name="purchasePrice"
                type="number"
                placeholder="Ex: 700"
                icon={DollarSign}
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                error={errors.purchasePrice}
              />
              <InputField
                label="Prix de vente (FCFA)"
                name="price"
                type="number"
                placeholder="Ex: 1000"
                icon={DollarSign}
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
              />
            </div>

            {/* Profit Margin Display */}
            {formData.price && formData.purchasePrice && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    Marge bénéficiaire:
                  </span>
                  <span
                    className={`font-bold ${
                      parseFloat(profitMargin.toString()) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {profitMargin}%
                  </span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Bénéfice par unité:{" "}
                  {(
                    parseFloat(formData.price) -
                    parseFloat(formData.purchasePrice)
                  ).toFixed(0)}{" "}
                  FCFA
                </div>
              </div>
            )}

            {/* Stock Status Display */}
            {formData.stock && formData.criticalStockThreshold && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-orange-800 font-medium">
                    Niveau de stock:
                  </span>
                  <span
                    className={`font-bold ${
                      parseInt(formData.stock) >
                      parseInt(formData.criticalStockThreshold)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {parseInt(formData.stock) >
                    parseInt(formData.criticalStockThreshold)
                      ? "Normal"
                      : "Stock faible"}
                  </span>
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  Alerte déclenchée quand stock ≤{" "}
                  {formData.criticalStockThreshold}
                </div>
              </div>
            )}
          </div>

          {/* Submit Status */}
          {submitStatus && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                submitStatus === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {submitStatus === "success" ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertCircle size={20} className="text-red-600" />
              )}
              {submitStatus === "success"
                ? isEditMode
                  ? "Produit modifié avec succès !"
                  : "Produit ajouté avec succès !"
                : isEditMode
                ? "Erreur lors de la modification du produit. Veuillez réessayer."
                : "Erreur lors de l'ajout du produit. Veuillez réessayer."}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200 border border-gray-300"
            >
              <Edit3 size={18} />
              Aperçu
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={`
                flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold 
                transition-all duration-200 min-w-[140px]
                ${
                  isSubmitting || loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : isEditMode
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                }
              `}
            >
              {isSubmitting || loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? "Modification..." : "Validation..."}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Modifier" : "Valider"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
