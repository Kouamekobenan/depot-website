// "use client";
import React from "react";

import Pagination from "../customer/Pagination";
import { OrderFilters, OrderHeader, OrderStatsCards, OrderTable, useOrders } from "../components/orders";

/**
 * Page de gestion des commandes - Version refactorisée
 *
 * Cette page utilise l'architecture Clean avec :
 * - Hook personnalisé pour la logique métier
 * - Composants purs pour l'affichage
 * - Services pour les appels API
 * - Types centralisés
 */
export default function Order() {
  // 🪝 HOOK MÉTIER - Toute la logique est ici
  const {
    // État
    orders,
    loading,
    error,

    // Pagination
    currentPage,
    totalPages,
    totalOrders,

    // Filtres
    searchTerm,
    statusFilter,

    // Statistiques
    stats,

    // Actions
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
    refresh,

    // Utilitaires
    
  } = useOrders({
    autoFetch: true,
    defaultLimit: 10,
  });

  return (
    <div className="flex gap-6 min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        {/* 🏷️ EN-TÊTE */}
        <OrderHeader totalOrders={totalOrders} loading={loading} />

        {/* 📊 STATISTIQUES */}
        <OrderStatsCards stats={stats} loading={loading} />

        {/* 🔍 FILTRES ET RECHERCHE */}
        <OrderFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onRefresh={refresh}
          loading={loading}
        />

        {/* 📋 TABLE DES COMMANDES */}
        <div className="space-y-0">
          <OrderTable
            orders={orders}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            totalOrders={totalOrders}
            onRefresh={refresh}
          />

          {/* 📄 PAGINATION */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              onPageChange={handlePageChange}
              loading={loading}
              itemsPerPage={10}
            />
          )}
        </div>
      </div>
    </div>
  );
}
