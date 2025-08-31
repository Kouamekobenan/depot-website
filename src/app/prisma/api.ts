// renderer/src/lib/api.ts (déplacez depuis prisma vers lib)
import axios, { AxiosError, AxiosResponse } from "axios";
import { OrderDto } from "../types/type";

// Gestionnaire de tokens hybride (Electron + Web)
const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      // Essayer d'abord Electron
      if (typeof window !== "undefined" && window.electronAPI) {
        const electronToken = await window.electronAPI.getToken();
        return electronToken || null;
      }
      // Sinon utiliser localStorage pour le web
      else if (typeof window !== "undefined") {
        const localToken = localStorage.getItem("authToken");
        const sessionToken = sessionStorage.getItem("authToken");
        return localToken || sessionToken || null;
      }
    } catch (error) {
      console.warn("Erreur lors de la récupération du token:", error);
    }
    return null;
  },
  async setToken(token: string): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        await window.electronAPI.setToken(token);
      } else if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        // Optionnel: aussi dans sessionStorage pour une double sauvegarde
        sessionStorage.setItem("authToken", token);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du token:", error);
    }
  },

  async deleteToken(): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        await window.electronAPI.deleteToken();
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du token:", error);
    }
  },
};
// Configuration de base
const api = axios.create({
  baseURL:"https://api-boisson-production-bd26.up.railway.app",
  timeout: 15000, // Augmenté pour les connexions lentes
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// Intercepteur pour les requêtes (ajouter le token automatiquement)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await TokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Impossible de récupérer le token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses (gestion des erreurs globales)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      console.warn("Token expiré ou invalide, suppression du token");

      // Token expiré, supprimer le token stocké
      try {
        await TokenManager.deleteToken();

        // Redirection vers la page de connexion
        if (typeof window !== "undefined") {
          // Vérifier si on est sur une page qui nécessite une authentification
          const currentPath = window.location.pathname;
          const publicPaths = ["/login", "/register", "/", "/about"];

          if (!publicPaths.includes(currentPath)) {
            window.location.href = "/login";
          }
        }
      } catch (tokenError) {
        console.warn("Erreur lors de la suppression du token:", tokenError);
      }
    }

    // Gestion des erreurs réseau
    if (!error.response) {
      console.error("Erreur réseau:", error.message);

      // Notification d'erreur
      if (typeof window !== "undefined") {
        // Pour Electron
        if (window.electronAPI && window.electronAPI.notifyLoginSuccess) {
          window.electronAPI.notifyLoginSuccess(
            "Erreur de connexion",
            "Impossible de se connecter au serveur"
          );
        }
        // Pour le web, vous pouvez utiliser une notification toast ou alert
        else {
          console.error("Connexion au serveur impossible");
          // Ici vous pouvez ajouter votre système de notification web
          // Par exemple: toast.error("Impossible de se connecter au serveur");
        }
      }
    }

    return Promise.reject(error);
  }
);

// Export du gestionnaire de tokens pour l'utiliser ailleurs dans l'app
export { TokenManager };
export default api;
// Utilitaires
export const formatDate = (dateString: Date | string): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function sendOrderViaWhatsApp(
  order: OrderDto,
  supplierPhone: string
): void {
  try {
    // Formatage du message de commande
    const orderMessage = encodeURIComponent(
      `🛒 *Nouvelle Commande 12Dépôt*\n\n` +
        `📋 Commande: ${order.id || "N/A"}\n` +
        `📅 Date: ${formatDate(new Date())}\n` +
        `Merci pour votre service !`
    );

    const whatsappUrl = `https://wa.me/${supplierPhone}?text=${orderMessage}`;

    // Ouvrir dans Electron ou navigateur
    if (typeof window !== "undefined") {
      if (window.electronAPI) {
        // Dans Electron, on peut contrôler l'ouverture
        window.open(whatsappUrl, "_blank");
      } else {
        // Dans le navigateur web classique
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi WhatsApp:", error);
  }
}

// Fonctions utilitaires supplémentaires pour l'authentification
export const AuthUtils = {
  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return !!token;
  },

  // Se connecter (à appeler après une connexion réussie)
  async login(token: string): Promise<void> {
    await TokenManager.setToken(token);
  },

  // Se déconnecter
  async logout(): Promise<void> {
    await TokenManager.deleteToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};
