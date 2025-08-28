"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../forms/Button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/app/prisma/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Register() {
  const [mounted, setMounted] = useState(false); // 🚀 nouvelle protection
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    tenantId: tenantId,
    role: "ADMIN",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 🚀 évite l'erreur SSR, attend le rendu client
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/register", form);

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Compte créé avec succès !");
        router.push("/dashbord");
      } else {
        toast.error("Échec de l'enregistrement. Vérifiez vos données.");
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };

        toast.error(
          axiosError.response?.data?.message ||
            "Erreur lors de la création du compte"
        );
      } else {
        toast.error("Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 placeholder:bg-gray-100">
      <Toaster position="top-right" />
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleBack}
            className="p-2 cursor-pointer rounded-md bg-gray-200 placeholder:text-black"
          >
            Retour
          </button>
        </div>
        <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Créer votre compte
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champs du formulaire */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Saisissez votre adresse mail"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white placeholder:text-black"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
              className="w-full p-2 pr-10 border rounded-md dark:bg-gray-700 dark:text-white placeholder:text-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Saisissez votre nom"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white placeholder:text-black"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Ex: 0700000000"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white placeholder:text-black"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
          </select>

          <Button
            type="submit"
            disabled={loading}
            label={
              loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />{" "}
                  Enregistrement...
                </span>
              ) : (
                "Enregistrer"
              )
            }
            className={`w-full text-white ${
              loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
            }`}
          />
        </form>
      </div>
    </div>
  );
}
