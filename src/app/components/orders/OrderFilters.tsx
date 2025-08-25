import React from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import { STATUS_OPTIONS } from "@/app/utils/orderUtil";

interface OrderFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onRefresh,
  loading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est automatique avec le debounce dans le hook
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barre de recherche */}
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par ID de commande..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              disabled={loading}
            />
          </div>
        </form>

        {/* Filtres */}
        <div className="flex items-center gap-4">
          {/* Filtre par statut */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={loading}
              className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton rafraîchir */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
