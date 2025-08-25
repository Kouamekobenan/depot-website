"use client";

import React, { useEffect } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { deliveryDto } from "@/app/types/type";
import { formatDate } from "@/app/prisma/api";
import { handleBack } from "@/app/types/handleApi";

interface DeliveryInvoiceClientProps {
  delivery: deliveryDto;
}

// Styles CSS pour l'impression
const printStyles = `
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @page {
      size: A4 portrait;
      margin: 0.5in;
    }
    
    body {
      font-size: 12px !important;
      line-height: 1.3 !important;
    }
    
    .print-header {
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%) !important;
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .print-bg-gray {
      background-color: #f9fafb !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-bg-blue {
      background-color: #dbeafe !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-text-green {
      color: #059669 !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-text-red {
      color: #dc2626 !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-text-orange {
      color: #ea580c !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-border {
      border: 1px solid #d1d5db !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-table {
      width: 100% !important;
      font-size: 10px !important;
      border-collapse: collapse !important;
    }
    
    .print-table th,
    .print-table td {
      padding: 6px 4px !important;
      border: 1px solid #d1d5db !important;
      word-wrap: break-word !important;
    }
    
    .print-table th {
      background-color: #f3f4f6 !important;
      font-weight: bold !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-compact {
      margin: 4px 0 !important;
      padding: 8px !important;
    }
    
    .print-title {
      font-size: 18px !important;
      font-weight: bold !important;
      color: white !important;
    }
    
    .print-small {
      font-size: 10px !important;
    }
    
    .print-badge-green {
      background-color: #dcfce7 !important;
      color: #166534 !important;
      padding: 2px 6px !important;
      border-radius: 12px !important;
      font-size: 9px !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-badge-red {
      background-color: #fee2e2 !important;
      color: #991b1b !important;
      padding: 2px 6px !important;
      border-radius: 12px !important;
      font-size: 9px !important;
      -webkit-print-color-adjust: exact !important;
    }
    
    .print-badge-yellow {
      background-color: #fef3c7 !important;
      color: #92400e !important;
      padding: 2px 6px !important;
      border-radius: 12px !important;
      font-size: 9px !important;
      -webkit-print-color-adjust: exact !important;
    }
  }
`;

export default function DeliveryInvoiceClient({
  delivery,
}: DeliveryInvoiceClientProps) {
  // Ajouter les styles d'impression au document
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = printStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("Fonctionnalité de téléchargement PDF à implémenter");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalDelivered = () => {
    return (
      delivery?.deliveryProducts.reduce(
        (sum, item) => sum + item.deliveredQuantity * item.product.price,
        0
      ) || 0
    );
  };

  const calculateTotalReturned = () => {
    return (
      delivery?.deliveryProducts.reduce(
        (sum, item) => sum + item.returnedQuantity * item.product.price,
        0
      ) || 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec actions */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-2 bg-gray-600 p-2 rounded-md text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Facture */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête de la facture */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 print-header p-6 print:p-4">
            <div className="flex justify-between items-start print:block">
              <div className="print:mb-4">
                <h1 className="text-3xl print-title print:text-lg font-bold mb-2">
                  FACTURE DE LIVRAISON
                </h1>
                <p className="text-orange-100 print:text-white print-small">
                  Bon de livraison détaillé
                </p>
              </div>
              <div className="text-right print:text-left">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 print:p-2 print:bg-white/30">
                  <p className="text-sm text-orange-100 print:text-white print-small">
                    N° de facture
                  </p>
                  <p className="text-xl print:text-base font-bold text-white">
                    {delivery?.id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="p-6 print:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 mb-6 print:mb-4">
              {/* Informations du livreur */}
              <div className="bg-gray-50 print-bg-gray rounded-lg p-4 print-compact">
                <h2 className="text-lg print:text-sm font-semibold mb-3 print:mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 print:h-4 print:w-4" />
                  Informations du Livreur
                </h2>
                <div className="space-y-2 print:space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium print:text-xs">Nom:</span>
                    <span className="text-gray-700 font-bold print:text-xs">
                      {delivery?.deliveryPerson.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails de la livraison */}
              <div className="bg-gray-50 print-bg-gray rounded-lg p-4 print-compact">
                <h2 className="text-lg print:text-sm font-semibold mb-3 print:mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 print:h-4 print:w-4" />
                  Détails de la Livraison
                </h2>
                <div className="space-y-2 print:space-y-1">
                  {delivery?.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 print:h-3 print:w-3 text-gray-400" />
                      <span className="text-gray-700 print:text-xs">
                        {formatDate(delivery.createdAt)}
                      </span>
                    </div>
                  )}
                  {delivery?.status && (
                    <div className="flex items-center gap-2 print:block">
                      <span className="font-medium print:text-xs">Statut:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium print:inline-block print:ml-2 ${
                          delivery.status === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-800 print-badge-yellow"
                            : delivery.status === "COMPLETED"
                            ? "bg-green-100 text-green-800 print-badge-green"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tableau des produits */}
            <div className="mb-6 print:mb-4">
              <h2 className="text-xl print:text-sm font-semibold mb-4 print:mb-2 flex items-center gap-2">
                <Package className="h-6 w-6 print:h-4 print:w-4 text-orange-600 print-text-orange" />
                Détail des Produits
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse print-table">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-left font-semibold print:text-xs">
                        Code
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-left font-semibold print:text-xs">
                        Produit
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center font-semibold print:text-xs">
                        Prix unitaire
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center font-semibold print:text-xs">
                        Qté prévue
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center font-semibold print:text-xs">
                        Qté livrée
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center font-semibold print:text-xs">
                        Qté retournée
                      </th>
                      <th className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-right font-semibold print:text-xs">
                        Total livré
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivery?.deliveryProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-sm print:text-xs text-gray-600">
                          {item.id.slice(-8) || "-"}...
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 font-medium print:text-xs">
                          {item.product.name}
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center print:text-xs">
                          {formatCurrency(item.product.price)}
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center print:text-xs">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center">
                          <span className="bg-green-100 text-green-800 print-badge-green px-2 py-1 rounded-full text-sm font-medium print:text-xs">
                            {Number(item.deliveredQuantity)}
                          </span>
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-center">
                          {item.returnedQuantity > 0 ? (
                            <span className="bg-red-100 text-red-800 print-badge-red px-2 py-1 rounded-full text-sm font-medium print:text-xs">
                              {item.returnedQuantity}
                            </span>
                          ) : (
                            <span className="text-gray-400 print:text-xs">
                              0
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-200 print-border px-3 py-2 print:px-2 print:py-1 text-right font-semibold print:text-xs">
                          {formatCurrency(
                            item.deliveredQuantity * Number(item.product.price)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
              <div className="bg-blue-50 print-bg-blue rounded-lg p-4 print-compact">
                <h3 className="text-lg print:text-sm font-semibold mb-3 print:mb-2 text-orange-800 print-text-orange">
                  Récapitulatif
                </h3>
                <div className="space-y-2 print:space-y-1">
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Total prévu:</span>
                    <span className="font-medium">
                      {formatCurrency(delivery?.totalPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Total livré:</span>
                    <span className="font-medium text-green-600 print-text-green">
                      {formatCurrency(calculateTotalDelivered())}
                    </span>
                  </div>
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Total retourné:</span>
                    <span className="font-medium text-red-600 print-text-red">
                      {formatCurrency(calculateTotalReturned())}
                    </span>
                  </div>
                  <div className="border-t pt-2 print:pt-1">
                    <div className="flex justify-between text-lg print:text-sm font-bold">
                      <span>Net à payer:</span>
                      <span className="text-blue-600 print-text-orange">
                        {formatCurrency(calculateTotalDelivered())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 print-bg-gray rounded-lg p-4 print-compact">
                <h3 className="text-lg print:text-sm font-semibold mb-3 print:mb-2">
                  Statistiques
                </h3>
                <div className="space-y-2 print:space-y-1">
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Produits différents:</span>
                    <span className="font-medium">
                      {delivery?.deliveryProducts.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">
                      Unités totales prévues:
                    </span>
                    <span className="font-medium">
                      {delivery?.deliveryProducts.reduce(
                        (sum, item) => sum + Number(item.quantity),
                        0
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Unités livrées:</span>
                    <span className="font-medium text-green-600 print-text-green">
                      {delivery?.deliveryProducts.reduce(
                        (sum, item) => sum + Number(item.deliveredQuantity),
                        0
                      ) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between print:text-xs">
                    <span className="text-gray-600">Taux de livraison:</span>
                    <span className="font-medium">
                      {delivery
                        ? Math.round(
                            (delivery.deliveryProducts.reduce(
                              (sum, item) =>
                                sum + Number(item.deliveredQuantity),
                              0
                            ) /
                              delivery.deliveryProducts.reduce(
                                (sum, item) => sum + Number(item.quantity),
                                0
                              )) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="bg-gray-50 print-bg-gray px-6 py-4 print:px-4 print:py-2 border-t">
            <div className="text-center text-gray-600 text-sm print:text-xs">
              <p className="mb-2 print:mb-1">
                Cette facture a été générée automatiquement le{" "}
                {new Date().toLocaleDateString("fr-FR")}
              </p>
              <p className="print:text-xs">
                Pour toute question concernant cette facture, veuillez contacter
                le service client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
