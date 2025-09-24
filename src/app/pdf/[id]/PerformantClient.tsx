"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  Phone,
  Calendar,
  Hash,
  ArrowLeft,
  Share2,
} from "lucide-react";
import api, { formatDate } from "@/app/prisma/api";
import { OrderDto } from "@/app/types/type";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface InvoiceClientProps {
  orderId: string;
}

// Interface pour les items de commande
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Composant pour afficher les items en mode mobile (cartes)
const MobileItemCard = ({
  item,
  formatCurrency,
}: {
  item: OrderItem;
  formatCurrency: (amount: number) => string;
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
          {item.productName}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          ID: {item.productId.slice(-8)}...
        </p>
      </div>
      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium flex-shrink-0 ml-3">
        {item.quantity}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-gray-600 text-xs">Prix unitaire</span>
        <p className="font-medium text-gray-900">
          {formatCurrency(item.unitPrice)}
        </p>
      </div>
      <div>
        <span className="text-gray-600 text-xs">Total</span>
        <p className="font-bold text-gray-900">
          {formatCurrency(item.quantity * item.unitPrice)}
        </p>
      </div>
    </div>
  </div>
);

export default function InvoiceClient({ orderId }: InvoiceClientProps) {
  const printRef = useRef(null);
  const [order, setOrder] = useState<OrderDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const tenantName = user?.tenantName ?? "SO";

  useEffect(() => {
    const fetchOrder = async (orderId: string) => {
      try {
        setLoading(true);
        const response = await api.get(`/order/${orderId}`);
        console.log("data to order", response.data);
        setOrder(response.data);
        setError(null);
      } catch (error: unknown) {
        console.log("error api", error);
        setError("Erreur lors du chargement de la facture");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const taxRate = 0.18; // 18% TVA
  const totalTVA = Number(order?.totalPrice) * taxRate;
  const totalTTC = Number(order?.totalPrice) + totalTVA;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  const handleWhatsAppShare = () => {
    const message = `
Facture N° ${order?.id}
Date: ${order?.updatedAt && formatDate(order?.updatedAt)}
Total TTC: ${formatCurrency(totalTTC)}
Merci pour votre confiance - ${tenantName}
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-16 sm:w-16 border-b-2 border-orange-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="text-center">
              <div className="text-red-500 text-lg sm:text-xl mb-4">❌</div>
              <p className="text-gray-600 text-sm sm:text-base">
                {error || "Facture non trouvée"}
              </p>
              <Link href="/order" className="mt-4 inline-block">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base">
                  Retour
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Styles d'impression */}
      <style jsx>{`
        @media print {
          /* Masquer les boutons lors de l'impression */
          .no-print {
            display: none !important;
          }

          /* Styles pour l'impression */
          .print-container {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .print-page {
            background: white !important;
            min-height: auto !important;
          }

          /* Optimiser l'espace pour l'impression */
          .print-content {
            padding: 20px !important;
          }

          /* Ajuster les couleurs pour l'impression */
          .print-header {
            background: #ea580c !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Éviter les coupures de page dans le tableau */
          .print-table {
            page-break-inside: avoid;
          }

          .print-table tr {
            page-break-inside: avoid;
          }

          /* Masquer les cartes mobiles lors de l'impression */
          .mobile-cards {
            display: none !important;
          }

          /* Afficher le tableau lors de l'impression même sur mobile */
          .desktop-table {
            display: table !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 print-page">
        <div className="max-w-4xl mx-auto px-4 print-container">
          {/* Actions - Masquées lors de l'impression */}
          <div className="mb-4 sm:mb-6 no-print">
            {/* Mobile Actions */}
            <div className="flex flex-col sm:hidden gap-2 mb-4">
              <Link
                href="/order"
                className="flex justify-center cursor-pointer"
              >
                <button className="flex items-center gap-2 w-full justify-center bg-gray-200 hover:bg-gray-400 px-4 py-2 rounded-md cursor-pointer text-sm">
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
              >
                <Download size={16} />
                Télécharger PDF
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Share2 size={16} />
                Partager WhatsApp
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-3">
              <Link
                href="/order"
                className="flex justify-center cursor-pointer"
              >
                <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-400 px-4 py-2 rounded-md cursor-pointer">
                  <ArrowLeft size={18} />
                  Retour
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm"
              >
                <Download size={20} />
                Télécharger PDF
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              >
                <Share2 size={20} />
                Envoyer par WhatsApp
              </button>
            </div>
          </div>

          {/* Invoice */}
          <div
            ref={printRef}
            className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:m-0"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-4 sm:p-6 lg:p-8 print-header">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Logo */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
                      <span className="logo text-white font-bold text-sm sm:text-xl">
                        {tenantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                      {tenantName}
                    </h1>
                    <p className="text-orange-100 mt-1 text-xs sm:text-sm">
                      Solutions professionnelles
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-xl sm:text-2xl font-bold">FACTURE</h2>
                  <p className="text-orange-100 mt-1 text-xs sm:text-sm">
                    Document officiel
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 lg:p-8 print-content">
              {/* Invoice Info & Company Details */}
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8 mb-6 sm:mb-8">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Hash size={16} className="text-green-600 sm:w-5 sm:h-5" />
                    <span className="truncate">
                      Informations de facturation
                    </span>
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                        N° Facture:
                      </span>
                      <span className="font-bold text-green-600 break-all text-sm">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-600 text-xs sm:text-sm">
                          Date d&apos;émission:
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm">
                        {order.updatedAt && formatDate(order.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 lg:max-w-xs">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    Émetteur
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-sm break-all">
                      @{order.userName}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1 text-xs sm:text-sm">
                      <Phone
                        size={12}
                        className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                      />
                      <span className="break-all">{order.userPhone}</span>
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm break-all">
                      {order.userMail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Détails des articles
                </h3>

                {/* Desktop Table - Hidden on small screens, shown on print */}
                <div className="hidden sm:block desktop-table">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse print-table">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-700 text-xs sm:text-sm">
                            Description
                          </th>
                          <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700 text-xs sm:text-sm">
                            Qté
                          </th>
                          <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">
                            Prix unitaire
                          </th>
                          <th className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">
                            Total HT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
                              <div>
                                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.productId.slice(-8)}...
                                </p>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-xs sm:text-sm">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-right font-bold text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards - Visible on small screens, hidden on print */}
                <div className="sm:hidden mobile-cards">
                  {order.orderItems.map((item, index) => (
                    <MobileItemCard
                      key={index}
                      item={item}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-center sm:justify-end">
                <div className="w-full sm:max-w-sm">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Sous-total HT:</span>
                        <span className="font-medium break-all text-right">
                          {formatCurrency(Number(order.totalPrice))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">TVA (18%):</span>
                        <span className="font-medium break-all text-right">
                          {formatCurrency(totalTVA)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 sm:pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-base sm:text-lg font-bold text-gray-900">
                            Total TTC:
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-green-600 break-all text-right">
                            {formatCurrency(totalTTC)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <p>Merci pour votre confiance • {tenantName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
