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
import {
  formatDate,
  formatPrice,
  generateShortId,
} from "@/app/utils/orderUtil";
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
    <div className="flex items-center justify-center py-8 sm:py-12 px-4">
      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-orange-500" />
      <span className="ml-2 text-sm sm:text-base text-gray-600">
        Chargement des commandes...
      </span>
    </div>
  );

  const ErrorState = () => (
    <div className="flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm text-sm sm:text-base"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 sm:py-12 px-4">
      <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        Aucune commande trouvée
      </h3>
      <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
        {searchTerm || statusFilter !== "ALL"
          ? "Aucune commande ne correspond aux critères de recherche"
          : "Aucune commande n'a été passée pour le moment"}
      </p>
    </div>
  );
  // Rendu d'une ligne de commande
  const OrderRow: React.FC<{ order: OrderDto }> = ({ order }) => (
    <div className="p-3 sm:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
        {/* Informations principales de la commande */}
        <div className="flex-1 min-w-0">
          {/* En-tête avec ID et statut */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {generateShortId(order.id)}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>
          {/* Détails de la commande */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
            {/* Prix */}
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
            {/* Date */}
            {order.createdAt && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500 flex-shrink-0" />
                <span className="truncate">{formatDate(order.createdAt)}</span>
              </div>
            )}
            {/* Nombre d'articles */}
            {order.orderItems && (
              <div className="flex items-center">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500 flex-shrink-0" />
                <span className="truncate">
                  {order.orderItems.length} article
                  {order.orderItems.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2 lg:mt-0">
          {order.status === "PENDING" && (
            <Link
              href={`/detailOrder/${order.id}`}
              className="inline-flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-500 border border-green-300 rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Suivi</span>
            </Link>
          )}
          <Link
            href={`/detailOrder/${order.id}`}
            className="inline-flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Détails</span>
            <span className="sm:hidden">Voir</span>
          </Link>

          <Link
            href={`/pdf/${order.id}`}
            className="inline-flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Imprimer</span>
            <span className="sm:hidden">PDF</span>
          </Link>
        </div>
      </div>
    </div>
  );
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-2 sm:mx-0">
      {/* En-tête de la table */}
      <div className="p-3 sm:p-6 border-b border-gray-100">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          <span className="block sm:inline">Liste des Commandes</span>
          {orders.length > 0 && !loading && (
            <span className="block sm:inline sm:ml-2 text-xs sm:text-sm font-normal text-gray-500 mt-1 sm:mt-0">
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
