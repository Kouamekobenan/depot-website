"use client";
// import Navbar from "@/app/components/navbar/Navbar";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/prisma/api";
import {
  deliveryDto,
  deliveryPersonDto,
  deliveryProducts,
} from "@/app/types/type";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ValidateDeliveryClient({
  deliveryId,
}: {
  deliveryId: string;
}) {
  const [livPerson, setLivPerson] = useState<deliveryPersonDto[]>([]);
  const [delivery, setDelivery] = useState<deliveryDto | null>(null);
  const [deliveryProducts, setDeliveryProducts] = useState<deliveryProducts[]>(
    []
  );
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] =
    useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Fetch des livreurs
  useEffect(() => {
    const fetchDelivPerson = async () => {
      try {
        const resp = await api.get(`/deliveryPerson/${tenantId}`);
        setLivPerson(resp.data);
      } catch (error: unknown) {
        console.error("Erreur lors du chargement des livreurs:", error);
        setError("Impossible de charger les livreurs");
      }
    };
    if (tenantId) fetchDelivPerson();
  }, [tenantId]);

  // Fetch de la livraison
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/delivery/deliverie/${deliveryId}`);
        const data = response.data.data;
        setDelivery(data);
        setDeliveryProducts(data.deliveryProducts || []);
        setSelectedDeliveryPerson(data.deliveryPersonId || "");
      } catch (error: unknown) {
        console.error("Erreur lors du chargement de la livraison:", error);
        setError("Impossible de charger la livraison");
      } finally {
        setLoading(false);
      }
    };
    if (deliveryId) fetchDelivery();
  }, [deliveryId]);

  // Validation des quantités
  const validateQuantities = (): boolean => {
    for (const product of deliveryProducts) {
      const delivered = Number(product.deliveredQuantity) || 0;
      const returned = Number(product.returnedQuantity) || 0;
      const total = Number(product.quantity) || 0;

      if (delivered < 0 || returned < 0) {
        setError("Les quantités ne peuvent pas être négatives");
        return false;
      }

      if (delivered + returned > total) {
        setError(
          `La somme des quantités livrées et retournées ne peut pas dépasser la quantité totale pour ${product.product?.name}`
        );
        return false;
      }
    }
    return true;
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDeliveryPerson) {
      setError("Veuillez sélectionner un livreur");
      return;
    }
    if (!validateQuantities()) {
      return;
    }
    try {
      setSubmitting(true);
      setError("");

      await api.patch(`/delivery/${deliveryId}`, {
        deliveryPersonId: selectedDeliveryPerson,
        deliveryProducts: deliveryProducts.map((p) => ({
          id: p.id,
          productId: p.productId,
          quantity: Number(p.quantity) || 0,
          deliveredQuantity: Number(p.deliveredQuantity) || 0,
          returnedQuantity: Number(p.returnedQuantity) || 0,
        })),
        status: "validated",
      });
      toast.success("Livraison validée avec succès !");
      router.push("/deliveries");
    } catch (error: unknown) {
      console.error("Erreur lors de la validation:", error);
      setError("Erreur lors de la validation de la livraison");
    } finally {
      setSubmitting(false);
    }
  };

  // Gestion des champs
  const handleDeliveredQuantityChange = (index: number, value: number) => {
    const updated = [...deliveryProducts];
    updated[index] = { ...updated[index], deliveredQuantity: value };
    setDeliveryProducts(updated);
  };

  const handleReturnedQuantityChange = (index: number, value: number) => {
    const updated = [...deliveryProducts];
    updated[index] = { ...updated[index], returnedQuantity: value };
    setDeliveryProducts(updated);
  };

  // Statut produit
  const getProductStatus = (product: deliveryProducts): string => {
    const delivered = Number(product.deliveredQuantity) || 0;
    const returned = Number(product.returnedQuantity) || 0;
    const total = Number(product.quantity) || 0;

    if (delivered === total && returned === 0) {
      return "Livré complet";
    } else if (delivered > 0 && returned === 0) {
      return "Partiellement livré";
    } else if (returned > 0) {
      return "Avec retour";
    } else {
      return "Non livré";
    }
  };
  // Statistiques
  const getDeliveryStats = () => {
    const stats = {
      totalProducts: deliveryProducts.length,
      fullyDelivered: 0,
      partiallyDelivered: 0,
      withReturns: 0,
      notDelivered: 0,
    };
    deliveryProducts.forEach((product) => {
      const delivered = Number(product.deliveredQuantity) || 0;
      const returned = Number(product.returnedQuantity) || 0;
      const total = Number(product.quantity) || 0;

      if (delivered === total && returned === 0) {
        stats.fullyDelivered++;
      } else if (delivered > 0 && returned === 0) {
        stats.partiallyDelivered++;
      } else if (returned > 0) {
        stats.withReturns++;
      } else {
        stats.notDelivered++;
      }
    });
    return stats;
  };

  // --- Rendu ---
  if (loading) {
    return (
      <div className="p-8 flex-1 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-lg font-medium text-gray-600">
            Chargement de la livraison...
          </div>
        </div>
      </div>
    );
  }

  if (error && !delivery) {
    return (
      <div className="p-8 flex-1">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getDeliveryStats();

  return (
   <div className="flex w-full min-h-screen bg-gray-50">
         {/* <Navbar /> */}
         <div className="p-8 flex-1">
           {/* En-tête avec design amélioré */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
             <div className="flex justify-between items-center">
               <div>
                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
                   Validation de Livraison
                 </h1>
                 <p className="text-gray-600">
                   Gérez et validez les détails de la livraison
                 </p>
               </div>
               <div className="flex items-center space-x-6">
                 <div className="text-right">
                   <p className="text-sm text-gray-500 font-medium">
                     Montant prévu
                   </p>
                   <p className="text-2xl font-bold text-emerald-600">
                     {delivery?.totalPrice?.toLocaleString()} FCFA
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => router.back()}
                   className="flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 border border-gray-300"
                 >
                   <svg
                     className="w-5 h-5 mr-2"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M15 19l-7-7 7-7"
                     />
                   </svg>
                   Retour
                 </button>
               </div>
             </div>
           </div>
   
           {/* Messages d'erreur avec design amélioré */}
           {error && (
             <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm mb-8">
               <div className="flex items-center">
                 <div className="flex-shrink-0">
                   <svg
                     className="h-6 w-6 text-red-400"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                     />
                   </svg>
                 </div>
                 <div className="ml-3">
                   <p className="text-red-700 font-medium">{error}</p>
                 </div>
               </div>
             </div>
           )}
   
           {delivery && (
             <>
               {/* Statistiques avec design cards amélioré */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="text-3xl font-bold text-blue-600 mb-1">
                         {stats.totalProducts}
                       </div>
                       <div className="text-sm font-medium text-gray-600">
                         Total produits
                       </div>
                     </div>
                     <div className="p-3 bg-orange-300 rounded-full">
                       <svg
                         className="w-6 h-6 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                         />
                       </svg>
                     </div>
                   </div>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="text-3xl font-bold text-emerald-600 mb-1">
                         {stats.fullyDelivered}
                       </div>
                       <div className="text-sm font-medium text-gray-600">
                         Livrés complets
                       </div>
                     </div>
                     <div className="p-3 bg-orange-300 rounded-full">
                       <svg
                         className="w-6 h-6 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M5 13l4 4L19 7"
                         />
                       </svg>
                     </div>
                   </div>
                 </div>
   
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="text-3xl font-bold text-amber-600 mb-1">
                         {stats.partiallyDelivered}
                       </div>
                       <div className="text-sm font-medium text-gray-600">
                         Partiellement livrés
                       </div>
                     </div>
                     <div className="p-3 bg-orange-300 rounded-full">
                       <svg
                         className="w-6 h-6 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                         />
                       </svg>
                     </div>
                   </div>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                   <div className="flex items-center justify-between">
                     <div>
                       <div className="text-3xl font-bold text-red-600 mb-1">
                         {stats.withReturns}
                       </div>
                       <div className="text-sm font-medium text-gray-600">
                         Avec retours
                       </div>
                     </div>
                     <div className="p-3 bg-orange-300 rounded-full">
                       <svg
                         className="w-6 h-6 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
                         />
                       </svg>
                     </div>
                   </div>
                 </div>
               </div>
               <form onSubmit={handleSubmit} className="space-y-8">
                 {/* Section livreur avec design amélioré */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="flex items-center mb-4">
                     <div className="p-2 bg-orange-300 rounded-lg mr-3">
                       <svg
                         className="w-5 h-5 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                         />
                       </svg>
                     </div>
                     <h2 className="text-xl font-semibold text-gray-900">
                       Assignation du Livreur
                     </h2>
                   </div>
                   <select
                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-gray-50 font-medium"
                     value={selectedDeliveryPerson}
                     onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                     required
                   >
                     <option value="">Sélectionner un livreur</option>
                     {livPerson.map((person) => (
                       <option value={person.id} key={person.id}>
                         {person.name}
                       </option>
                     ))}
                   </select>
                 </div>
                 {/* Section produits avec design amélioré */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <div className="flex items-center mb-6">
                     <div className="p-2 bg-orange-300 rounded-lg mr-3">
                       <svg
                         className="w-5 h-5 text-white"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                         />
                       </svg>
                     </div>
                     <h2 className="text-xl font-semibold text-gray-900">
                       Validation des Produits
                     </h2>
                   </div>
                   <div className="space-y-4">
                     {deliveryProducts.map((product, index) => (
                       <div
                         key={product.id}
                         className="border-2 border-gray-100 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200"
                       >
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex-1">
                             <h3 className="text-lg font-semibold text-gray-900 mb-2">
                               {product.product?.name}
                             </h3>
                             <div className="flex items-center space-x-4">
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                 Quantité prévue: {product.quantity}
                               </span>
                             </div>
                           </div>
                           <span
                             className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${
                               getProductStatus(product) === "Livré complet"
                                 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                 : getProductStatus(product) ===
                                   "Partiellement livré"
                                 ? "bg-amber-50 text-amber-700 border-amber-200"
                                 : getProductStatus(product) === "Avec retour"
                                 ? "bg-red-50 text-red-700 border-red-200"
                                 : "bg-gray-50 text-gray-700 border-gray-200"
                             }`}
                           >
                             {getProductStatus(product)}
                           </span>
                         </div>
   
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="block text-sm font-semibold text-gray-700">
                               Quantité livrée
                             </label>
                             <input
                               type="number"
                               min={0}
                               max={Number(product.quantity)}
                               value={product.deliveredQuantity || ""}
                               onChange={(e) =>
                                 handleDeliveredQuantityChange(
                                   index,
                                   Number(e.target.value)
                                 )
                               }
                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-0 transition-colors duration-200 font-medium"
                               placeholder="Entrer la quantité livrée"
                             />
                           </div>
   
                           <div className="space-y-2">
                             <label className="block text-sm font-semibold text-gray-700">
                               Quantité retournée
                             </label>
                             <input
                               type="number"
                               min={0}
                               max={Number(product.quantity)}
                               value={product.returnedQuantity || ""}
                               onChange={(e) =>
                                 handleReturnedQuantityChange(
                                   index,
                                   Number(e.target.value)
                                 )
                               }
                               className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-0 transition-colors duration-200 font-medium"
                               placeholder="Entrer la quantité retournée"
                             />
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
   
                 {/* Boutons d'action avec design amélioré */}
                 <div className="flex justify-end space-x-4 pt-6">
                   <button
                     type="button"
                     onClick={() => router.back()}
                     className="flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 border-2 border-gray-300"
                     disabled={submitting}
                   >
                     <svg
                       className="w-5 h-5 mr-2"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M6 18L18 6M6 6l12 12"
                       />
                     </svg>
                     Annuler
                   </button>
                   <button
                     type="submit"
                     className="flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:bg-emerald-300 disabled:cursor-not-allowed"
                     disabled={submitting}
                   >
                     {submitting ? (
                       <>
                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                         Validation en cours...
                       </>
                     ) : (
                       <>
                         <svg
                           className="w-5 h-5 mr-2"
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                         >
                           <path
                             strokeLinecap="round"
                             strokeLinejoin="round"
                             strokeWidth={2}
                             d="M5 13l4 4L19 7"
                           />
                         </svg>
                         Valider la livraison
                       </>
                     )}
                   </button>
                 </div>
               </form>
             </>
           )}
         </div>
       </div>
  );
}
