"use client";
import { useState } from "react";
import Manager from "./Manager";
import SuperAdmin from "./pageClient";

export default function PageServer() {
  const [activeTab, setActiveTab] = useState<"tenants" | "managers">("tenants");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Tabs Navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("tenants")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === "tenants"
                  ? "border-orange-500 text-orange-600 bg-orange-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🏢 Gestion des Tenants
            </button>
            <button
              onClick={() => setActiveTab("managers")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === "managers"
                  ? "border-violet-500 text-violet-600 bg-violet-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              👥 Managers par Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "tenants" ? <SuperAdmin /> : <Manager />}
    </div>
  );
}
