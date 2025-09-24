import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface OrderHeaderProps {
  totalOrders: number;
  loading: boolean;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  totalOrders,
  loading,
}) => {
  return (
    <div className="mb-6 sm:mb-8 px-4 sm:px-0">
      {/* Layout responsive: colonne sur mobile, ligne sur desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
        {/* Section titre et navigation */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Bouton retour et titre */}
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <Link href="/dashbord">
              <button className="bg-gray-500 cursor-pointer text-white hover:bg-gray-600 p-2 sm:px-3 sm:py-2 rounded-md transition-colors shadow-sm border border-gray-300 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Gestion des Commandes
            </h1>
          </div>

          {/* Compteur de commandes */}
          <div className="flex items-center ml-0 sm:ml-12 lg:ml-14">
            <p className="text-sm sm:text-base text-gray-600">
              {!loading &&
                totalOrders > 0 &&
                `${totalOrders} commande${totalOrders > 1 ? "s" : ""} au total`}
            </p>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-end lg:justify-start mt-2 lg:mt-0">
          <Link href="/commandes">
            <button className="inline-flex font-bold items-center px-3 py-2 sm:px-4 sm:py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm border border-green-300 text-sm sm:text-base whitespace-nowrap">
              <span className="hidden sm:inline">Passer une commande</span>
              <span className="sm:hidden">Nouvelle commande</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
