"use client";

import api from "@/app/prisma/api";
import { OrderDto } from "@/app/types/type";
import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  Clock,
  CreditCard,
  Package,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  BarChart3,
  // Menu,
  // X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Interfaces pour les données enrichies des produits
interface EnrichedOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Prix d'achat
  sellingPrice: number; // Prix de vente récupéré depuis Product
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface EnrichedOrderDto extends Omit<OrderDto, "orderItems"> {
  orderItems?: EnrichedOrderItem[];
}

interface OrderDetailClientProps {
  orderId: string;
}

// Composants utilitaires
const ProfitAnalysis = () => <></>;

const StatCard = ({
  title,
  value,
  icon: Icon,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-600 truncate">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
          {value}
        </p>
      </div>
      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0 ml-2" />
    </div>
  </div>
);

// Composant pour afficher les produits en mode mobile (cartes)
const MobileProductCard = ({
  product,
  formatPrice,
  calculateItemProfit,
  calculateItemProfitMargin,
  getProfitMarginColor,
}: {
  product: EnrichedOrderItem;
  formatPrice: (price: number) => string;
  calculateItemProfit: (item: EnrichedOrderItem) => number;
  calculateItemProfitMargin: (item: EnrichedOrderItem) => number;
  getProfitMarginColor: (margin: number) => string;
}) => {
  const itemProfit = calculateItemProfit(product);
  const itemProfitMargin = calculateItemProfitMargin(product);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
            <div className="h-full w-full rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {product.productName}
            </h4>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
              Qty: {product.quantity}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600 text-xs">Prix d&apos;achat</span>
          <p className="font-semibold text-red-600">
            {formatPrice(product.unitPrice)}
          </p>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Prix de vente</span>
          <p className="font-semibold text-blue-600">
            {formatPrice(product.sellingPrice)}
          </p>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Coût total</span>
          <p className="font-semibold text-red-700">
            {formatPrice(product.unitPrice * product.quantity)}
          </p>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Revenus</span>
          <p className="font-semibold text-blue-700">
            {formatPrice(product.sellingPrice * product.quantity)}
          </p>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Bénéfice</span>
          <p className="font-bold text-green-700">{formatPrice(itemProfit)}</p>
        </div>
        <div>
          <span className="text-gray-600 text-xs">Marge</span>
          <span
            className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getProfitMarginColor(
              itemProfitMargin
            )}`}
          >
            {itemProfitMargin.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [orders, setOrders] = useState<EnrichedOrderDto>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalQuantity =
    orders?.orderItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ||
    0;

  // Fonctions de calcul de rentabilité avec prix de vente réels
  const calculateTotalCost = () => {
    return (
      orders?.orderItems?.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ) || 0
    );
  };

  const calculateTotalRevenue = () => {
    return (
      orders?.orderItems?.reduce((sum, item) => {
        return sum + item.sellingPrice * item.quantity;
      }, 0) || 0
    );
  };

  const calculateTotalProfit = () => {
    return calculateTotalRevenue() - calculateTotalCost();
  };

  const calculateProfitMargin = () => {
    const revenue = calculateTotalRevenue();
    if (revenue === 0) return 0;
    return (calculateTotalProfit() / revenue) * 100;
  };

  const calculateItemProfit = (item: EnrichedOrderItem) => {
    return (item.sellingPrice - item.unitPrice) * item.quantity;
  };

  const calculateItemProfitMargin = (item: EnrichedOrderItem) => {
    if (item.sellingPrice === 0) return 0;
    return ((item.sellingPrice - item.unitPrice) / item.sellingPrice) * 100;
  };

  useEffect(() => {
    const fetchOrders = async (orderId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données de la commande
        const orderRes = await api.get(`/order/${orderId}`);
        const orderData = orderRes.data;

        // Enrichir les données avec les prix de vente des produits
        if (orderData.orderItems && orderData.orderItems.length > 0) {
          const enrichedItems = await Promise.all(
            orderData.orderItems.map(async (item: OrderItem) => {
              try {
                // Récupérer les informations complètes du produit
                const productRes = await api.get(`/product/${item.productId}`);
                const productData = productRes.data;

                return {
                  ...item,
                  sellingPrice:
                    productData.sellingPrice ||
                    productData.price ||
                    item.unitPrice * 1.3, // Fallback si pas de prix de vente
                };
              } catch (error) {
                console.warn(
                  `Erreur lors de la récupération du produit ${item.productId}:`,
                  error
                );
                // Fallback en cas d'erreur
                return {
                  ...item,
                  sellingPrice: item.unitPrice * 1.3,
                };
              }
            })
          );

          orderData.orderItems = enrichedItems;
        }

        console.log("data to order enriched:", orderData);
        setOrders(orderData);
      } catch (error: unknown) {
        console.log("Erreur Api", error);
        setError("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrders(orderId);
    }
  }, [orderId]);

  const validateOrder = async (id: string) => {
    try {
      setActionLoading("validate");
      await api.patch(`/order/completed/${id}`);
      toast.success("La commande à été validée avec succès!");
      // Recharger les données pour mettre à jour le statut
      const res = await api.get(`/order/${id}`);
      setOrders(res.data);
    } catch (error: unknown) {
      console.log("erreur api", error);
      toast.error("Erreur lors de la validation de la commande");
    } finally {
      setActionLoading(null);
    }
  };

  const canceledOrder = async (id: string) => {
    try {
      setActionLoading("cancel");
      await api.patch(`/order/${id}`);
      toast.success("La commande à été annulée avec succès!");
      // Recharger les données pour mettre à jour le statut
      const res = await api.get(`/order/${id}`);
      setOrders(res.data);
    } catch (error: unknown) {
      console.log("erreur api", error);
      toast.error("Erreur lors de l'annulation de la commande");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(price);
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 25) return "bg-green-100 text-green-800";
    if (margin >= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mb-4" />
          <p className="text-red-600 text-base sm:text-lg font-medium text-center">
            {error || "Commande non trouvée"}
          </p>
          <Link href="/order" className="mt-4">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base">
              Retour aux commandes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Link href="/order" className="cursor-pointer">
                <button className="mr-3 sm:mr-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Détails de la commande
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">
                  Commande #{orderId}
                </p>
              </div>
            </div>

            {/* Action buttons - Mobile dropdown */}
            {orders.status === "PENDING" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <button
                  onClick={() => validateOrder(orders.id)}
                  disabled={actionLoading === "validate"}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                >
                  {actionLoading === "validate" ? "Validation..." : "Valider"}
                </button>
                <button
                  onClick={() => canceledOrder(orders.id)}
                  disabled={actionLoading === "cancel"}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                >
                  {actionLoading === "cancel" ? "Annulation..." : "Annuler"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Summary Card */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Informations de la commande</span>
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Caissier(ère)
                        </p>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          @{orders.userName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Statut
                        </p>
                        <span
                          className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                            orders.status || ""
                          )}`}
                        >
                          {orders.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Coût de la commande
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                          {formatPrice(orders.totalPrice || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Prix d&apos;achat total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Bénéfice potentiel
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600 truncate">
                          {formatPrice(calculateTotalProfit())}
                        </p>
                        <p className="text-xs text-gray-500">
                          Marge: {calculateProfitMargin().toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <StatCard
              title="Articles"
              value={orders.orderItems?.length || 0}
              icon={Package}
            />
            <StatCard
              title="Quantité totale"
              value={totalQuantity}
              icon={ShoppingCart}
            />
            {/* Indicateur de rentabilité */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">
                    ROI Potentiel
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-800 truncate">
                    {calculateProfitMargin().toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600">
                    Retour sur investissement
                  </p>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Analyse de Rentabilité */}
        <ProfitAnalysis />

        {/* Products Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">
                  Produits commandés avec analyse de rentabilité
                </span>
              </h3>
            </div>

            {/* Desktop Table - Hidden on small screens */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix d&apos;achat
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix de vente
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coût total
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bénéfice
                    </th>
                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marge
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.orderItems?.map((prod, index) => {
                    const itemProfit = calculateItemProfit(prod);
                    const itemProfitMargin = calculateItemProfitMargin(prod);

                    return (
                      <tr
                        key={prod.productId}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                              <div className="h-full w-full rounded-lg bg-blue-100 flex items-center justify-center">
                                <Package className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                              </div>
                            </div>
                            <div className="ml-4 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {prod.productName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {formatPrice(prod.unitPrice)}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          {formatPrice(prod.sellingPrice)}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {prod.quantity}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-700">
                          {formatPrice(prod.unitPrice * prod.quantity)}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                          {formatPrice(prod.sellingPrice * prod.quantity)}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                          {formatPrice(itemProfit)}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getProfitMarginColor(
                              itemProfitMargin
                            )}`}
                          >
                            {itemProfitMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible on small screens */}
            <div className="lg:hidden p-4">
              {orders.orderItems?.map((prod) => (
                <MobileProductCard
                  key={prod.productId}
                  product={prod}
                  formatPrice={formatPrice}
                  calculateItemProfit={calculateItemProfit}
                  calculateItemProfitMargin={calculateItemProfitMargin}
                  getProfitMarginColor={getProfitMarginColor}
                />
              ))}
            </div>

            {/* Enhanced Total Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-4 sm:py-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">
                    Coût Total d&apos;Achat
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-red-600 truncate block">
                    {formatPrice(calculateTotalCost())}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">
                    Revenus Potentiels
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-blue-600 truncate block">
                    {formatPrice(calculateTotalRevenue())}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 block mb-1">
                    Bénéfice Potentiel
                  </span>
                  <span className="text-xl sm:text-3xl font-bold text-green-600 truncate block">
                    {formatPrice(calculateTotalProfit())}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    Marge: {calculateProfitMargin().toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500 text-center">
                  Calculs basés sur les prix de vente réels des produits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
