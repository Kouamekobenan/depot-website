"use client";
import { useAuth } from "@/app/context/AuthContext";
import api, { formatDate } from "@/app/prisma/api";
import { handleBack } from "@/app/types/handleApi";
import { directSaleDto } from "@/app/types/type";
import {
  CalendarDays,
  PhoneForwarded,
  Printer,
  ReceiptSwissFranc,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Composant d'icône flèche (peut être extrait dans un fichier séparé)
const ArrowLeftIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12,19 5,12 12,5"></polyline>
  </svg>
);

interface PrintSaleClientProps {
  directeSaleId: string;
}

export default function PrintSaleClient({
  directeSaleId,
}: PrintSaleClientProps) {
  const [directeSale, setDirectSale] = useState<directSaleDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const userName = user?.name;
  const userPhone = user?.phone;

  const totalAmount = directeSale?.saleItems?.length
    ? directeSale.saleItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0
      )
    : 0;

  useEffect(() => {
    const fetchDirecteSale = async (directeSaleId: string) => {
      try {
        setLoading(true);
        const response = await api.get(`/directeSale/${directeSaleId}`);
        console.log("directe Sale", response.data);
        setDirectSale(response.data.data);
        setError(null);
      } catch (error: unknown) {
        console.log("Error during charge directe sale", error);
        setError("Erreur lors du chargement de la facture");
      } finally {
        setLoading(false);
      }
    };

    if (directeSaleId) {
      fetchDirecteSale(directeSaleId);
    }
  }, [directeSaleId]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF", // Franc CFA
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !directeSale) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-gray-600">{error || "Facture non trouvée"}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec boutons d'action - Masqué à l'impression */}
      <div className="print:hidden bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gray-700 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon />
            Retour
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Printer />
            Imprimer
          </button>
        </div>
      </div>

      {/* Contenu de la facture */}
      <div className="max-w-4xl mx-auto p-8 bg-white print:shadow-none print:max-w-none print:p-0">
        {/* En-tête de la facture */}
        <div className="border-b-2 border-gray-200 pb-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ReceiptSwissFranc />
                FACTURE DE VENTE
              </h1>
              <p className="text-gray-600">Facture N° {directeSale.id}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Montant total</p>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Informations de vente
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User />
                <span className="text-gray-600">Caissier:</span>
                <span className="font-medium">
                  {userName || "Non spécifié"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneForwarded />
                <span className="text-gray-600">Téléphone:</span>
                <span className="font-medium">
                  {userPhone || "Non spécifié"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {directeSale.createdAt
                    ? formatDate(directeSale.createdAt)
                    : new Date().toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Statut de paiement
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant payé:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(directeSale.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reste à payer:</span>
                <span
                  className={`font-semibold ${
                    directeSale.dueAmount > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(directeSale.dueAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    directeSale.dueAmount === 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {directeSale.dueAmount === 0
                    ? "Payé intégralement"
                    : "Paiement partiel"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Détail des produits
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Produit
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                    Quantité
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                    Prix unitaire
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                    Prix total
                  </th>
                </tr>
              </thead>
              <tbody>
                {directeSale?.saleItems?.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td
                    colSpan={3}
                    className="border border-gray-300 px-4 py-4 text-right font-bold text-gray-900"
                  >
                    TOTAL GÉNÉRAL:
                  </td>
                  <td className="border border-gray-300 px-4 py-4 text-right font-bold text-xl text-orange-600">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Pied de page */}
        <div className="border-t-2 border-gray-200 pt-6 text-center text-gray-600">
          <p className="mb-2">Merci pour votre confiance</p>
          <p className="text-sm">
            Cette facture a été générée automatiquement le{" "}
            {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  );
}
