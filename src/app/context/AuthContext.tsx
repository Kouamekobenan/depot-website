"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../prisma/api";
import { User } from "../types/type";
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  // Vérifier si on est côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Ne s'exécute que côté client
    if (!isClient) return;
    const checkAuth = async () => {
      try {
        // Vérifier si electronAPI est disponible
        if (typeof window === "undefined" || !window.electronAPI) {
          console.log("ElectronAPI non disponible");
          setLoading(false);
          return;
        }

        const token = await window.electronAPI.getToken();
        console.log("Token récupéré :", token);

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        console.log(res.data);
        setIsAuthenticated(true);
      } catch (error: unknown) {
        console.error("Erreur lors de l'authentification :", error);
        setUser(null);
        setIsAuthenticated(false);
        // Nettoyer le token invalide
        if (window.electronAPI) {
          await window.electronAPI.deleteToken();
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isClient]);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.token?.access_token;

      if (!token) {
        throw new Error("Token non trouvé dans la réponse");
      }

      // Vérifier que electronAPI est disponible avant de l'utiliser
      if (window.electronAPI) {
        await window.electronAPI.setToken(token);
      } else {
        // Fallback: stocker dans localStorage si electronAPI n'est pas dispo
        localStorage.setItem("auth_token", token);
      }

      setIsAuthenticated(true);

      const userProfile = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userProfile.data);

      // Notification seulement si electronAPI est disponible
      if (window.electronAPI) {
        window.electronAPI.notifyLoginSuccess(
          "Connexion réussie",
          `Bienvenue ${userProfile.data.name} !`
        );
      }

      return userProfile.data;
    } catch (error: unknown) {
      console.error("Échec de la connexion :", error);
      setUser(null);
      setIsAuthenticated(false);
      const message = "Identifiants incorrects";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.deleteToken();
      } else {
        // Fallback: nettoyer localStorage
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Erreur lors du logout :", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Affichage de chargement pendant l'hydratation
  if (!isClient) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          loading: true,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
