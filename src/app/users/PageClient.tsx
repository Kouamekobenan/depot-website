"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Eye,
  Menu,
  X,
} from "lucide-react";
import api from "../prisma/api";
import Navbar from "../components/navbar/Navbar";
import Link from "next/link";
import toast from "react-hot-toast/headless";
import { useAuth } from "../context/AuthContext";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
  status?: "active" | "inactive";
}

interface paramsItem {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

export default function PageUserClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const limit = 10;

  // Fonction de recherche avec debouncing
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: paramsItem = {
        page: currentPage,
        limit,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (selectedRole && selectedRole !== "ALL") {
        params.role = selectedRole;
      }
      if (!tenantId) {
        return;
      }
      const response = await api.get(`users/paginate/${tenantId}`, { params });

      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        setTotalPages(response.data.totalPage || 1);
      } else {
        console.error("Format de réponse inattendu:", response.data);
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole, tenantId]);

  // Debouncing pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Réinitialiser à la page 1 lors d'une nouvelle recherche
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500); // Attendre 500ms après l'arrêt de la saisie

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedRole, currentPage, fetchUsers]);

  // Effet pour les changements de page
  useEffect(() => {
    fetchUsers();
  }, [currentPage, fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteUser = async (user_id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }
    try {
      await api.delete(`/users/${user_id}`);
      toast.success("Utilisateur supprimé avec succès!");
      // Recharger la liste après suppression
      fetchUsers();
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "delivery_person":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Composant pour affichage mobile des utilisateurs
  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-medium truncate">{user.name}</h3>
            <span className="text-gray-400 text-xs">#{user.id.slice(-4)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400 text-sm">Email: </span>
          <span className="text-gray-300 text-sm break-all">{user.email}</span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Téléphone: </span>
          <span className="text-gray-300 text-sm font-mono">{user.phone}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Rôle:</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
              user.role
            )}`}
          >
            {user.role}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Navbar />

      <div className="flex-1 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Gérez et surveillez tous les utilisateurs de votre plateforme
            </p>
          </div>

          {/* Actions Bar */}
          <div className="bg-gray-900 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            {/* Mobile: Compact layout with toggle */}
            <div className="block sm:hidden">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                  {showFilters ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </button>

                <Link href="/registere">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden xs:inline">Ajouter</span>
                  </button>
                </Link>
              </div>

              {/* Mobile Filters - Collapsible */}
              {showFilters && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none w-full"
                      value={selectedRole}
                      onChange={handleRoleChange}
                    >
                      <option value="ALL">Tous les rôles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  {(searchTerm || selectedRole !== "ALL") && (
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Desktop: Original layout */}
            <div className="hidden sm:block">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou email..."
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={selectedRole}
                      onChange={handleRoleChange}
                    >
                      <option value="ALL">Tous les rôles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  {(searchTerm || selectedRole !== "ALL") && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>

                {/* Add User Button */}
                <Link href="/registere">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Ajouter un utilisateur
                  </button>
                </Link>
              </div>
            </div>

            {/* Search Results Info */}
            {(searchTerm || selectedRole !== "ALL") && (
              <div className="mt-4 text-sm text-gray-400">
                {searchTerm && <span>Recherche: {searchTerm} </span>}
                {selectedRole !== "ALL" && <span>Rôle: {selectedRole} </span>}
                <span>({users.length} résultats trouvés)</span>
              </div>
            )}
          </div>

          {/* Users Content */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-400">Chargement...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 px-4">
                <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Aucun utilisateur trouvé
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchTerm || selectedRole !== "ALL"
                    ? "Essayez de modifier vos critères de recherche"
                    : "Aucun utilisateur disponible"}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: Card Layout */}
                <div className="block lg:hidden p-4">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {/* Desktop: Table Layout */}
                <div className="hidden lg:block">
                  {/* Table Header */}
                  <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                    <div className="grid grid-cols-12 gap-4 items-center font-medium text-gray-300 text-sm">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-3">Nom</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-2">Téléphone</div>
                      <div className="col-span-2">Rôle</div>
                      <div className="col-span-1 text-center">Actions</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="px-6 py-4 hover:bg-gray-800 transition-colors"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <span className="text-gray-400 text-sm font-mono">
                              #{user.id.slice(-4)}
                            </span>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-medium">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white font-medium truncate">
                                {user.name}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <span className="text-gray-300 truncate block">
                              {user.email}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-300 font-mono text-sm">
                              {user.phone}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 sm:mt-6">
              {/* Mobile Pagination - Simplified */}
              <div className="block sm:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    Page {currentPage}/{totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 bg-orange-600 text-white rounded text-sm">
                      {currentPage}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Pagination - Full */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="text-gray-400 text-sm">
                  Page {currentPage} sur {totalPages} ({users.length}{" "}
                  utilisateurs affichés)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Show only relevant page numbers on smaller screens */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const showPage =
                      totalPages <= 5 ||
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1;

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-orange-600 text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
