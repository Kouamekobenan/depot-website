"use client";

import { useState, useEffect, useMemo } from "react";
import Login from "./users/Login";
import Image from "next/image";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
// Constante pour définir la durée initiale du compte à rebours
const INITIAL_COUNTDOWN_SECONDS = 3;
export default function CountdownClient() {
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN_SECONDS);
  const [showLogin, setShowLogin] = useState(false);
  useEffect(() => {
    if (countdown === 0) {
      const timeout = setTimeout(() => setShowLogin(true), 500);
      return () => clearTimeout(timeout);
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]); 
  const progressPercentage = useMemo(() => {
    const elapsed = INITIAL_COUNTDOWN_SECONDS - countdown;
    return (elapsed / INITIAL_COUNTDOWN_SECONDS) * 100;
  }, [countdown]);
  if (showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-md w-full p-3 space-y-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Accéder à l&apos;Espace
          </h2>
          <Login />
        </div>
      </div>
    );
  }
  // Rendu de l'écran de chargement/compte à rebours
  return (
    // 🎨 Design du fond : Dégradé plein écran, centré
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center max-w-lg w-full">
        {/* En-tête avec titre et spinner moderne */}
        <div className="mb-10">
          <div className="relative mb-4 flex justify-center items-center">
            {/* Utilisation de Heroicon pour un spinner plus propre et animation standard */}
            <ArrowPathIcon
              className="h-10 w-10 text-orange-500 animate-spin"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              Système de Gestion
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mt-1">
            Initialisation et pré-chargement des ressources...
          </p>
        </div>

        {/* 💳 Card principale : Glassmorphism/Neumorphism subtil */}
        <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-100/50 dark:shadow-gray-900/50 border border-white/50 dark:border-gray-700/50 p-10 transform hover:scale-[1.01] transition-all duration-300">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {/* Ajout d'une bordure subtile et d'une ombre de couleur pour moderniser */}
            <div className="p-1 rounded-full bg-white dark:bg-gray-700 shadow-inner">
              <Image
                src="/logo12.png"
                width={100} // Taille réduite pour l'effet moderne
                height={100}
                alt="Logo de l'application"
                className="rounded-full shadow-lg"
                priority
              />
            </div>
          </div>

          {/* ⏳ Compte à Rebours */}
          <div className="mb-8">
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-red-600 mb-4 font-mono tracking-tighter">
              {/* Ajout d'une animation d'échelle pour l'effet de compte à rebours */}
              <span
                key={countdown}
                className="inline-block animate-pulse duration-300"
              >
                {countdown}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
              Connexion automatique dans {countdown} seconde
              {countdown !== 1 ? "s" : ""}
            </p>
          </div>
          {/* 📈 Barre de progression */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all ease-in-out duration-1000 bg-gradient-to-r from-orange-500 to-red-600 shadow-md shadow-orange-500/50"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Indicateur de statut */}
          <div className="flex items-center justify-center space-x-3 text-gray-600 dark:text-gray-400 mt-5">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
            <span className="text-sm font-medium">Système opérationnel.</span>
          </div>
        </div>

        {/* Footer subtil */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Veuillez patienter quelques instants...
          </p>
        </div>
      </div>
    </div>
  );
}
