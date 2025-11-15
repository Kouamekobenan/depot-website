"use client";

import api from "@/app/prisma/api";

export async function subscribeToPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    alert("Les notifications ne sont pas disponibles sur votre navigateur.");
    return;
  }

  if (!("PushManager" in window)) {
    alert("Les notifications push ne sont pas supportées.");
    return;
  }

  try {
    // 1. Vérifier si l'utilisateur est connecté
    const token = await getToken();
    if (!token) {
      alert("Vous devez être connecté pour activer les notifications.");
      return;
    }

    // 2. Demander la permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Permission de notification refusée.");
      return;
    }

    // 3. Enregistrer le service worker
    const swReg = await navigator.serviceWorker.register("/sw.js");
    console.log("✅ Service Worker enregistré");

    // 4. Vérifier si déjà abonné
    let subscription = await swReg.pushManager.getSubscription();

    if (!subscription) {
      // 5. Récupérer la clé publique VAPID
      const response = await api.get("/users/push/public-key");
      console.log("User public pushSubscription:", response.data);
      const publicKey = response.data.publicKey;

      // 6. S'abonner aux notifications push
      subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      console.log("✅ Abonnement push créé");
    } else {
      console.log("ℹ️ Déjà abonné aux notifications");
    }

    // 7. Envoyer la souscription au backend
    const subscriptionJson = subscription.toJSON();

    // ✅ Utiliser votre instance API qui gère automatiquement le token
    const result = await api.patch(
      "/users/push-subscription",
      subscriptionJson
    );

    console.log("✅ Souscription envoyée au serveur:", result.data);
    alert("Notifications activées avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'abonnement push:", error);
  }
}
// Fonction helper pour récupérer le token (compatible avec votre TokenManager)
async function getToken(): Promise<string | null> {
  try {
    // Pour Electron
    if (typeof window !== "undefined" && window.electronAPI) {
      return (await window.electronAPI.getToken()) ?? null;
    }
    // Pour le web
    else if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      );
    }
  } catch (error) {
    console.warn("Erreur lors de la récupération du token:", error);
  }
  return null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
