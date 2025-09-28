"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "../buttonConnecte/ButtonCont";
import Link from "next/link";
// Interface pour typer les données du formulaire
interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      switch (loggedUser.role) {
        case "MANAGER":
          router.push("/admin");
          break;
        case "DELIVERY_PERSON":
          router.push("/super_admin");
          break;
        default:
          router.push("/dashbord");
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      alert("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Formes décoratives en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 dark:bg-orange-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 dark:bg-orange-800 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Carte principale */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
              Bienvenue
            </h1>
            <p className="text-gray-600 font-serif dark:text-gray-400">
              Connectez-vous à votre compte
            </p>
          </div>
          {/* Formulaire */}
          <div className="space-y-6" onKeyPress={handleKeyPress}>
            {/* Champ Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-serif`}
                  placeholder="exemple@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl font-serif bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  {errors.password}
                </p>
              )}
            </div>
            {/* Bouton de connexion */}
            <Button
              label={
                isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )
              }
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            />
          </div>
          {/* Séparateur */}
          {/* Pied de page */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                Vous n&apos;avez pas encore d&apos;espace ?
              </p>

              <div className="flex justify-center">
                <Link href="/espace" className="group">
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5
                   bg-gradient-to-r from-orange-500 to-orange-600 
                   hover:from-orange-600 hover:to-orange-700 
                   active:from-orange-700 active:to-orange-800
                   text-white font-semibold text-sm sm:text-base
                   rounded-xl shadow-lg hover:shadow-xl active:shadow-md
                   transform hover:scale-105 active:scale-95
                   transition-all duration-200 ease-out
                   border border-orange-400/20
                   focus:outline-none focus:ring-4 focus:ring-orange-500/30
                   overflow-hidden"
                  >
                    {/* Effet de brillance animé */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                        transform -skew-x-12 -translate-x-full
                        group-hover:translate-x-full transition-transform duration-700"
                    ></div>

                    {/* Icône */}
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:rotate-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>

                    {/* Texte */}
                    <span className="relative z-10 whitespace-nowrap">
                      Créer votre site
                    </span>

                    {/* Particules d'effet au clic */}
                    <div className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-150">
                      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                      <div
                        className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </button>
                </Link>
              </div>

              {/* Texte d'accompagnement */}
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
                Configurez votre espace en quelques minutes et commencez à gérer
                votre activité
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
