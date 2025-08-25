// renderer/src/lib/api.ts (déplacez depuis prisma vers lib)
import axios, { AxiosError, AxiosResponse } from "axios";
import { OrderDto } from "../types/type";

// Configuration de base
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api-boisson-production-bd26.up.railway.app",
  timeout: 15000, // Augmenté pour les connexions lentes
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur pour les requêtes (ajouter le token automatiquement)
api.interceptors.request.use(
  async (config) => {
    // Récupérer le token depuis Electron si disponible
    if (typeof window !== "undefined" && window.electronAPI) {
      try {
        const token = await window.electronAPI.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Impossible de récupérer le token:", error);
      }
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
      // Token expiré, supprimer le token stocké
      if (typeof window !== "undefined" && window.electronAPI) {
        try {
          await window.electronAPI.deleteToken();
          // Optionnel: rediriger vers la page de connexion
          window.location.href = "/login";
        } catch (tokenError) {
          console.warn("Erreur lors de la suppression du token:", tokenError);
        }
      }
    }

    // Gestion des erreurs réseau
    if (!error.response) {
      console.error("Erreur réseau:", error.message);
      // Notification Electron optionnelle
      if (typeof window !== "undefined" && window.electronAPI) {
        window.electronAPI.notifyLoginSuccess(
          "Erreur de connexion",
          "Impossible de se connecter au serveur"
        );
      }
    }

    return Promise.reject(error);
  }
);

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


