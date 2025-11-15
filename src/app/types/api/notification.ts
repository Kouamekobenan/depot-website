"use client";

import api from "@/app/prisma/api";

export async function subscribeToPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    alert("Les notifications ne sont pas disponibles sur votre navigateur.");
    return;
  }
  // Service worker
  const swReg = await navigator.serviceWorker.register("/sw.js");
  // Vérifier si déjà abonné
  let subscription = await swReg.pushManager.getSubscription();
  if (!subscription) {
    const response = await api.get("/users/push/public-key");
    console.log("User public pushSubscription:", response.data);

    // Extraire la clé publique de l'objet
    const publicKey = response.data.publicKey;

    subscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const subscriptionJson = subscription.toJSON();

  await fetch(
    "https://api-boisson-production-bd26.up.railway.app/users/push-subscription",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionJson),
    }
  );

  alert("Notifications activées !");
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
