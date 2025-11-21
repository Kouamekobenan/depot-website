"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { User } from "../types/type";
import api from "../prisma/api";
export default function Manager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search] = useState("");

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const managers = await api.get("/users/manager");
      console.log("data manager", managers.data);
      setUsers(managers.data);
    } catch (error) {
      console.log(error);
      setError("Impossible de charger les managers. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchManagers();
  }, []);

  const filtered = users.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white/90">
      {/* Header */}
      <header className="bg-white backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-orange-600 rounded-xl shadow-lg shadow-violet-500/20">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Gestion des Managers
                </h1>
                <p className="text-xs text-orange-600 sm:text-sm">
                  Vue d&apos;ensemble par tenant
                </p>
              </div>
            </div>
            <button
              onClick={fetchManagers}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats & Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 sm:mb-8">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 lg:pb-0">
            <div className="flex-shrink-0 bg-white backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-4 min-w-[140px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="text-2xl sm:text-3xl font-bold">{users.length}</p>
              <p className="text-slate-500 text-xs">managers</p>
            </div>
            <div className="flex-shrink-0 bg-white backdrop-blur border border-slate-700 rounded-xl p-3 sm:p-4 min-w-[140px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Tenants
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
                {new Set(users.map((u) => u.tenantName)).size}
              </p>
              <p className="text-slate-500 text-xs">actifs</p>
            </div>
          </div>
        </div>
        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-700 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-red-500/10 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={fetchManagers}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-slate-800 rounded-full mb-4">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 text-center">
              {search
                ? "Aucun résultat pour cette recherche"
                : "Aucun manager disponible"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((manager) => (
              <div
                key={manager.id}
                className="group bg-white backdrop-blur border border-slate-700 rounded-2xl p-5 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 font-semibold text-lg shadow-lg">
                      {manager.tenantName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className=" font-semibold truncate group-hover:text-violet-300 transition-colors">
                      {manager.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate ">{manager.tenantName}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-slate-700/50">
                  <a
                    href={`tel:${manager.phone}`}
                    className="flex items-center gap-2.5  hover:text-violet-300 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 " />
                    <span>{manager.phone}</span>
                  </a>
                  <a
                    href={`mailto:${manager.email}`}
                    className="flex items-center gap-2.5 hover:text-violet-300 transition-colors text-sm truncate"
                  >
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{manager.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-slate-500 text-sm mt-8">
            Affichage de {filtered.length} manager
            {filtered.length > 1 ? "s" : ""} sur {users.length}
          </p>
        )}
      </main>
    </div>
  );
}
