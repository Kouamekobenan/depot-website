"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Phone, Calendar, Hash } from "lucide-react";
import api, { formatDate } from "@/app/prisma/api";
import { OrderDto } from "@/app/types/type";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface InvoiceClientProps {
  orderId: string;
}

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">❌</div>
              <p className="text-gray-600">{error || "Facture non trouvée"}</p>
              <Link href="/order" className="mt-4 inline-block">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
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
            background: #1e40af !important;
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
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-8 print-page">
        <div className="max-w-4xl mx-auto px-4 print-container">
          {/* Actions - Masquées lors de l'impression */}
          <div className="mb-6 flex gap-3 no-print">
            <Link href="/order" className="flex justify-center cursor-pointer">
              <button className="bg-gray-200 hover:bg-gray-400 px-2 rounded-md cursor-pointer">
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
              Envoyer par WhatsApp
            </button>
          </div>

          {/* Invoice */}
          <div
            ref={printRef}
            className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:m-0"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-8 print-header">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
                      <span className="logo text-white font-bold text-xl">
                        {tenantName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{tenantName}</h1>
                    <p className="text-blue-100 mt-1">
                      Solutions professionnelles
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">FACTURE</h2>
                  <p className="text-blue-100 mt-1">Document officiel</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 print-content">
              {/* Invoice Info & Company Details */}
              <div className="flex justify-between gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Hash size={20} className="text-green-600" />
                    Informations de facturation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">
                        N° Facture:
                      </span>
                      <span className="font-bold text-green-600">
                        {order.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-600">
                        Date d&apos;émission:
                      </span>
                      <span>
                        {order.updatedAt && formatDate(order.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Émetteur
                  </h3>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">@{order.userName}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone size={14} />
                      {order.userPhone}
                    </p>
                    <p className="text-gray-600">{order.userMail}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Détails des articles
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse print-table">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                          Description
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">
                          Qté
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                          Prix unitaire
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                          Total HT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.productId.slice(-8)}...
                              </p>
                            </div>
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-right font-medium">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="border border-gray-200 px-4 py-3 text-right font-bold text-gray-900">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total HT:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(order.totalPrice))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">TVA (18%):</span>
                        <span className="font-medium">
                          {formatCurrency(totalTVA)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            Total TTC:
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(totalTTC)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-6 text-sm"></div>
                <div className="mt-6 text-center text-xs text-gray-500">
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
