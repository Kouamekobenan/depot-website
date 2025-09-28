"use client";

import { useState, useEffect } from "react";
import Login from "./users/Login";
import Image from "next/image";

export default function CountdownClient() {
  const [countdown, setCountdown] = useState(5);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLogin(true);
    }
  }, [countdown]);

  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-xl flex flex-col justify-center items-center">
          <Login />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Header avec spinner */}
      <div className="mb-12">
        <div className="relative mb-2">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-orange-500 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-orange-300 animate-pulse mx-auto"></div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight font-sans">
          <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent font-extrabold">
            Système de Gestion
          </span>
        </h1>
        <p className="text-lg text-slate-600 font-medium font-sans">
          Chargement en cours...
        </p>
      </div>
      {/* Card principale */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-10 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center items-center mb-8">
          <div className="relative">
            <Image
              src="/logo12.png"
              width={180}
              height={180}
              alt="Logo de l'application"
              className="drop-shadow-lg"
              priority
            />
          </div>
        </div>
        {/* Countdown */}
        <div className="mb-6">
          <div className="text-7xl font-black text-transparent bg-gradient-to-b from-orange-500 to-orange-600 bg-clip-text mb-4 font-mono tracking-tight">
            {countdown}
          </div>
          <p className="text-slate-700 font-medium text-lg font-sans">
            Connexion dans {countdown} seconde{countdown !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          ></div>
        </div>
        {/* Indicateur de statut */}
        <div className="flex items-center justify-center space-x-2 text-slate-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium font-sans">
            Initialisation du système
          </span>
        </div>
      </div>
      {/* Footer subtil */}
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm font-sans">
          Veuillez patienter pendant le chargement
        </p>
      </div>
    </div>
  );
}
