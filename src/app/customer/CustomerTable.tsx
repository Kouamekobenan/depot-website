"use client";
import React, { useState } from "react";
import {
  Trash,
  Users,
  Mail,
  Phone,
  MapPin,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { customerDto } from "../types/type";

interface CustomerTableProps {
  customers: customerDto[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string, name: string) => Promise<void>;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  deletingId,
  onDelete,
}) => {
  const [showMobileActions, setShowMobileActions] = useState<string | null>(
    null
  );

  const TableHeader: React.FC = () => (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>Nom</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>Téléphone</span>
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>Adresse</span>
          </div>
        </th>
        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );

  const TableRow: React.FC<{ customer: customerDto }> = ({ customer }) => (
    <tr className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-orange-300 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {customer.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.email || "-"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{customer.phone || "-"}</div>
      </td>
      <td className="px-6 py-4">
        <div
          className="text-sm text-gray-900 max-w-xs truncate"
          title={customer.address}
        >
          {customer.address || "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <button
          onClick={() => onDelete(customer.id, customer.name)}
          disabled={deletingId === customer.id}
          className="inline-flex items-center justify-center p-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Supprimer le client"
        >
          {deletingId === customer.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash className="w-4 h-4" />
          )}
        </button>
      </td>
    </tr>
  );

  // Mobile Card Component
  const MobileCard: React.FC<{ customer: customerDto }> = ({ customer }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 mx-2 sm:mx-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm sm:text-lg">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
              {customer.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={() => onDelete(customer.id, customer.name)}
            disabled={deletingId === customer.id}
            className="inline-flex items-center justify-center p-1.5 sm:p-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Supprimer le client"
          >
            {deletingId === customer.id ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
          <button
            onClick={() =>
              setShowMobileActions(
                showMobileActions === customer.id ? null : customer.id
              )
            }
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* Email */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm text-gray-900 truncate">
              {customer.email || "Non renseigné"}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-green-100 rounded-lg">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Téléphone
            </p>
            <p className="text-sm text-gray-900 truncate">
              {customer.phone || "Non renseigné"}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-purple-100 rounded-lg mt-0.5">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Adresse
            </p>
            <p className="text-sm text-gray-900 break-words line-clamp-2 sm:line-clamp-none">
              {customer.address || "Non renseignée"}
            </p>
          </div>
        </div>
      </div>

      {/* Extended Info (shown when actions menu is open) */}
      {showMobileActions === customer.id && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                ID Client
              </span>
              <span className="text-sm text-gray-600 font-mono">
                {customer.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        Aucun client trouvé
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        Aucun client n&apos;est enregistré dans votre base de données. Commencez
        par ajouter votre premier client.
      </p>
    </div>
  );

  const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <span className="text-lg font-medium text-gray-700">
          Chargement des clients...
        </span>
      </div>
      <p className="text-gray-500 text-center">
        Veuillez patienter pendant le chargement des données.
      </p>
    </div>
  );

  // Desktop Table Empty State
  const TableEmptyState: React.FC = () => (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun client trouvé
          </h3>
          <p className="text-gray-500">
            Aucun client n&apos;est enregistré dans votre base de données.
          </p>
        </div>
      </td>
    </tr>
  );

  // Desktop Table Loading State
  const TableLoadingState: React.FC = () => (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
          <span className="text-gray-600">Chargement des clients...</span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="w-full">
      {/* Desktop Table - Hidden on mobile/tablet */}
      <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <TableLoadingState />
              ) : customers.length === 0 ? (
                <TableEmptyState />
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} customer={customer} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Cards - Visible only on smaller screens */}
      <div className="lg:hidden px-2 sm:px-0">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-2 sm:mx-0">
            <LoadingState />
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-2 sm:mx-0">
            <EmptyState />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header for mobile */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 mx-2 sm:mx-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Clients
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {customers.length} client{customers.length !== 1 ? "s" : ""}{" "}
                    enregistré{customers.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3 sm:space-y-4">
              {customers.map((customer) => (
                <MobileCard key={customer.id} customer={customer} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Responsive Summary Card - Visible on all screens when data exists */}
    </div>
  );
};

export default CustomerTable;
