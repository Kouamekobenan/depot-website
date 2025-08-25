import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Package,
  Eye,
  Printer,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { formatDate, formatPrice, generateShortId } from "@/app/utils/orderUtil";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderDto } from "@/app/types/api/order.types";

interface OrderTableProps {
  orders: OrderDto[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  totalOrders: number;
  onRefresh: () => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  error,
  searchTerm,
  statusFilter,
  totalOrders,
  onRefresh,
}) => {
  // États de chargement et d'erreur
  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      <span className="ml-2 text-gray-600">Chargement des commandes...</span>
    </div>
  );

  const ErrorState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Aucune commande trouvée
      </h3>
      <p className="text-gray-600">
        {searchTerm || statusFilter !== "ALL"
          ? "Aucune commande ne correspond aux critères de recherche"
          : "Aucune commande n'a été passée pour le moment"}
      </p>
    </div>
  );

  // Rendu d'une ligne de commande
  const OrderRow: React.FC<{ order: OrderDto }> = ({ order }) => (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {generateShortId(order.id)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-orange-500" />
              <span className="font-medium text-gray-900">
                {formatPrice(order.totalPrice)}
              </span>
            </div>

            {order.createdAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            )}

            {order.orderItems && (
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-1 text-green-500" />
                <span>
                  {order.orderItems.length} article
                  {order.orderItems.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <Link
              href={`/detailOrder/${order.id}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 border border-green-300 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Suivi
            </Link>
          )}

          <Link
            href={`/detailOrder/${order.id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Détails
          </Link>

          <Link
            href={`/pdf/${order.id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* En-tête de la table */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Liste des Commandes
          {orders.length > 0 && !loading && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({orders.length} sur {totalOrders})
            </span>
          )}
        </h2>
      </div>

      {/* Contenu de la table */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          orders.map((order) => <OrderRow key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
};
