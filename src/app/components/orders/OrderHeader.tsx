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
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex gap-3">
            <Link href="/dashbord">
              <button className="bg-gray-500 cursor-pointer text-white hover:bg-gray-600 px-2 py-0.5 rounded-md transition-colors shadow-sm border border-gray-300">
                <ArrowLeft />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Commandes
            </h1>
          </div>

          <div className="flex text-center items-center">
            <p className="text-gray-600">
              {!loading &&
                totalOrders > 0 &&
                `${totalOrders} commande${totalOrders > 1 ? "s" : ""} au total`}
            </p>
          </div>
        </div>

        <Link href="/commandes">
          <button className="inline-flex font-bold items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm border border-green-300">
            Passer une commande
          </button>
        </Link>
      </div>
    </div>
  );
};
