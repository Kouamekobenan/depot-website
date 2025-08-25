import React from "react";
import { Users } from "lucide-react";

interface CustomerHeaderProps {
  totalCustomers: number;
  loading: boolean;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  totalCustomers,
  loading,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Gestion des clients
            </h1>
            {!loading && (
              <p className="text-gray-600 mt-1">
                {totalCustomers} client{totalCustomers > 1 ? "s" : ""} au total
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHeader;
