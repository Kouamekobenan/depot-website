"use client";

import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/app/prisma/api";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/app/context/AuthContext";
import Button from "../components/buttonConnecte/ButtonCont";
// Types et interfaces
interface FormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  tenantId?: string;
  role: "MANAGER";
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

export default function CreateEspace(): React.JSX.Element | null {
  // États avec typage strict
  const [mounted, setMounted] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [siteName, setSiteName] = useState<string>("");
  const router = useRouter();
  //   const { user } = useAuth() as { user: AuthUser | null };
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    tenantId: "",
    role: "MANAGER",
  });

  // Effet pour la protection SSR
  useEffect((): void => {
    setMounted(true);
  }, []);

  // Protection contre l'hydratation SSR
  if (!mounted) {
    return null;
  }
  // Gestionnaire de changement pour les champs du formulaire
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Gestionnaire de changement pour le nom du site
  const handleSiteNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSiteName(e.target.value);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!siteName.trim()) {
      toast.error("Le nom du site est obligatoire");
      return false;
    }

    if (!form.email || !form.password || !form.name || !form.phone) {
      toast.error("Tous les champs sont obligatoires");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Veuillez saisir une adresse email valide");
      return false;
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Veuillez saisir un numéro de téléphone valide");
      return false;
    }
    return true;
  };

  // Gestionnaire de soumission du formulaire
  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const payload = {
        name: siteName.trim(),
        user: {
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          role: form.role,
        },
      };
      console.log("Payload envoyé:", payload);
      await api.post("/tenant/space", payload);
      toast.success("Felicitation votre site à été créer avec succès!");
      router.push("/");
    } catch (error: unknown) {
      console.error("Erreur lors de la création:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.response?.data?.error ||
        "Erreur lors de la création du compte";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de retour
  const handleBack = (): void => {
    router.back();
  };

  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-8 text-white relative">
          <button
            onClick={handleBack}
            className="absolute top-6 left-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Créer votre espace</h1>
            <p className="text-blue-100 text-lg">
              Configurez votre site et créez votre compte administrateur
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Configuration du site */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Building2
                    size={18}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Configuration du site
                </h2>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="space-y-2">
                  <label
                    htmlFor="siteName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nom de votre site <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="siteName"
                    type="text"
                    value={siteName}
                    onChange={handleSiteNameChange}
                    required
                    placeholder="Ex: Mon Commerce, Boutique ABC..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ce nom apparaîtra comme titre de votre espace de gestion
                  </p>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Informations administrateur
                </span>
              </div>
            </div>

            {/* Section 2: Informations utilisateur */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <User
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Compte administrateur
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Mail size={16} className="inline mr-2" />
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    placeholder="admin@exemple.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Nom complet */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <User size={16} className="inline mr-2" />
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Phone size={16} className="inline mr-2" />
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    required
                    placeholder="+225 07 00 00 00 00"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  />
                </div>

                {/* Mot de passe */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Shield size={16} className="inline mr-2" />
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleFormChange}
                      required
                      placeholder="Minimum 6 caractères"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Utilisez au moins 6 caractères avec un mélange de lettres et
                    chiffres
                  </p>
                </div>
              </div>
            </div>
            {/* Bouton de soumission */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={loading}
                label={
                  loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Création en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Building2 size={20} />
                      Créer mon espace
                    </span>
                  )
                }
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all transform ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                }`}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
