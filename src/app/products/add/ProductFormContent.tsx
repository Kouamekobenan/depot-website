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
  // Edit3,
  AlertCircle,
  CheckCircle,
  Contact,
  Eye,
  TrendingUp,
  Warehouse,
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

// Composant InputField amélioré
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
  <div className="group">
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-slate-500" />}
        {label}
        <span className="text-red-500 ml-1">*</span>
      </div>
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`
          w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 ease-in-out
          text-slate-900 placeholder:text-slate-400 font-medium
          bg-white shadow-sm focus:shadow-lg
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
          }
          focus:outline-none group-hover:shadow-md
        `}
        {...props}
      />
      {error && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AlertCircle size={20} className="text-red-500" />
        </div>
      )}
    </div>
    {error && (
      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Composant pour les sélecteurs
const SelectField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ id: string; name: string }>;
  placeholder: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  error?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  error,
}) => (
  <div className="group">
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-slate-500" />}
        {label}
        <span className="text-red-500 ml-1">*</span>
      </div>
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 ease-in-out
          text-slate-900 font-medium bg-white shadow-sm focus:shadow-lg
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
          }
          focus:outline-none group-hover:shadow-md appearance-none cursor-pointer
        `}
      >
        <option value="" className="text-slate-400">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-slate-900">
            {option.name}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    {error && (
      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Composant pour les zones de texte
const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows?: number;
  error?: string;
}> = ({ label, name, value, onChange, placeholder, rows = 3, error }) => (
  <div className="group">
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-slate-500" />
        {label}
        <span className="text-red-500 ml-1">*</span>
      </div>
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      autoComplete="off"
      className={`
        w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 ease-in-out
        text-slate-900 placeholder:text-slate-400 font-medium resize-none
        bg-white shadow-sm focus:shadow-lg
        ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
        }
        focus:outline-none group-hover:shadow-md
      `}
    />
    {error && (
      <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default function ProductFormContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");
  const isEditMode = Boolean(productId);

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
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode);
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
        router.push("/products");
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

    if (
      formData.price &&
      formData.purchasePrice &&
      parseFloat(formData.price) <= parseFloat(formData.purchasePrice)
    ) {
      newErrors.price = "Le prix de vente doit être supérieur au prix d'achat";
    }

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

      // let response;
      if (isEditMode && productId) {
      await api.put(`/product/${productId}`, productData);
        toast.success("Produit modifié avec succès!");
      } else {
         await api.post(`/product/tenant/${tenantId}`, productData);
        toast.success("Produit ajouté avec succès!");
      }

      setSubmitStatus("success");

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

  // Loading state amélioré
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Chargement en cours...
              </h3>
              <p className="text-slate-600">
                Récupération des données du produit
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header amélioré */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  {isEditMode ? "Modification de produit" : "Nouveau produit"}
                </h1>
                <p className="text-slate-600 text-lg">
                  {isEditMode
                    ? "Modifiez les informations de ce produit"
                    : "Ajoutez un nouveau produit à votre inventaire"}
                </p>
              </div>
            </div>
            <Link href="/products">
              <Button
                className="flex items-center gap-2 px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                label={
                  <>
                    <ArrowLeft size={16} />
                    Retour à la liste
                  </>
                }
              />
            </Link>
          </div>
        </div>
        {/* Formulaire amélioré */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section Informations générales */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <FileText size={24} className="text-orange-500" />
                    Informations générales
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Détails essentiels du produit
                  </p>
                </div>
                <div className="space-y-6">
                  <InputField
                    label="Nom du produit"
                    name="name"
                    placeholder="Ex: Coca-Cola 33cl"
                    icon={Package}
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                  />
                  <TextAreaField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Ex: Boisson gazeuse rafraîchissante au cola"
                    rows={4}
                    error={errors.description}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Tag size={24} className="text-blue-500" />
                    Classification
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Catégorie et fournisseur
                  </p>
                </div>
                <div className="space-y-6">
                  <SelectField
                    label="Catégorie"
                    name="categoryProductId"
                    value={formData.categoryProductId}
                    onChange={handleInputChange}
                    options={categories}
                    placeholder="-- Sélectionner une catégorie --"
                    icon={Tag}
                    error={errors.categoryProductId}
                  />
                  <SelectField
                    label="Fournisseur"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    options={suppliers}
                    placeholder="-- Sélectionner un fournisseur --"
                    icon={Contact}
                    error={errors.supplierId}
                  />
                </div>
              </div>
            </div>

            {/* Section Stock */}
            <div className="border-t border-slate-200 pt-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <Warehouse size={24} className="text-green-500" />
                  Gestion des stocks
                </h2>
                <p className="text-slate-600 mt-1">
                  Quantités et seuils d&apos;alerte
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {/* Section Tarification */}
            <div className="border-t border-slate-200 pt-8">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <DollarSign size={24} className="text-emerald-500" />
                  Informations tarifaires
                </h2>
                <p className="text-slate-600 mt-1">Prix d&apos;achat et de vente</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

              {/* Cartes d'informations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marge bénéficiaire */}
                {formData.price && formData.purchasePrice && (
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="text-emerald-600" size={24} />
                        <h3 className="font-bold text-emerald-800">
                          Rentabilité
                        </h3>
                      </div>
                      <span
                        className={`text-2xl font-bold px-3 py-1 rounded-lg ${
                          parseFloat(profitMargin.toString()) > 0
                            ? "text-emerald-700 bg-emerald-200"
                            : "text-red-700 bg-red-200"
                        }`}
                      >
                        {profitMargin}%
                      </span>
                    </div>
                    <div className="text-emerald-700 font-medium">
                      Bénéfice par unité:{" "}
                      <span className="font-bold">
                        {(
                          parseFloat(formData.price) -
                          parseFloat(formData.purchasePrice)
                        ).toFixed(0)}{" "}
                        FCFA
                      </span>
                    </div>
                  </div>
                )}

                {/* Niveau de stock */}
                {formData.stock && formData.criticalStockThreshold && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Warehouse className="text-blue-600" size={24} />
                        <h3 className="font-bold text-blue-800">
                          Niveau de stock
                        </h3>
                      </div>
                      <span
                        className={`text-lg font-bold px-3 py-1 rounded-lg ${
                          parseInt(formData.stock) >
                          parseInt(formData.criticalStockThreshold)
                            ? "text-green-700 bg-green-200"
                            : "text-red-700 bg-red-200"
                        }`}
                      >
                        {parseInt(formData.stock) >
                        parseInt(formData.criticalStockThreshold)
                          ? "Normal"
                          : "Stock faible"}
                      </span>
                    </div>
                    <div className="text-blue-700 font-medium">
                      Alerte déclenchée quand stock ≤{" "}
                      {formData.criticalStockThreshold}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status de soumission */}
            {submitStatus && (
              <div
                className={`rounded-xl border-2 p-6 ${
                  submitStatus === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  {submitStatus === "success" ? (
                    <CheckCircle size={24} className="text-green-600" />
                  ) : (
                    <AlertCircle size={24} className="text-red-600" />
                  )}
                  <div>
                    <h3
                      className={`font-bold ${
                        submitStatus === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {submitStatus === "success"
                        ? isEditMode
                          ? "Modification réussie !"
                          : "Produit ajouté avec succès !"
                        : isEditMode
                        ? "Erreur lors de la modification"
                        : "Erreur lors de l'ajout"}
                    </h3>
                    <p
                      className={
                        submitStatus === "success"
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      {submitStatus === "success"
                        ? "Redirection en cours vers la liste des produits..."
                        : "Veuillez vérifier vos informations et réessayer."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="border-t border-slate-200 pt-8">
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 border border-slate-300 hover:shadow-lg hover:border-slate-400"
                >
                  <Eye size={20} />
                  Aperçu
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={`
                    flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold
                    text-white shadow-lg transition-all duration-300 min-w-[180px]
                    ${
                      isSubmitting || loading
                        ? "bg-slate-400 cursor-not-allowed"
                        : isEditMode
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    }
                  `}
                >
                  {isSubmitting || loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? "Modification..." : "Enregistrement..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditMode ? "Modifier le produit" : "Créer le produit"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
