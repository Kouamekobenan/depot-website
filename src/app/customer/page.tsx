// "use client";
import React from "react";
import Navbar from "../components/navbar/Navbar";
import CustomerHeader from "./CustomerHeader";
import CustomerTable from "./CustomerTable";
import Pagination from "./Pagination";
import { useCustomers } from "./useCustomers";

const Customer: React.FC = () => {
  const {
    customers,
    currentPage,
    totalPages,
    totalItems,
    loading,
    deletingId,
    handleDeleteCustomer,
    handlePageChange,
  } = useCustomers(10);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <CustomerHeader totalCustomers={customers.length} loading={loading} />

        {/* Customer Table */}
        <div className="space-y-0">
          <CustomerTable
            customers={customers}
            loading={loading}
            deletingId={deletingId}
            onDelete={handleDeleteCustomer}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Customer;
