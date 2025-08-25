import React from "react";
import { Trash, Users, Mail, Phone, MapPin, Loader2 } from "lucide-react";
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

  const EmptyState: React.FC = () => (
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

  const LoadingState: React.FC = () => (
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
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <LoadingState />
            ) : customers.length === 0 ? (
              <EmptyState />
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id} customer={customer} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
