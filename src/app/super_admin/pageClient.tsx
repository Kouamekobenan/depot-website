"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Users,
  Check,
  X,
  Search,
  Calendar,
} from "lucide-react";
import api from "../prisma/api";
import toast from "react-hot-toast";
import Link from "next/link";

// Types
interface TenantDto {
  id: string;
  name: string;
  createdAt?: string;
  userCount?: number;
}

const SuperAdmin: React.FC = () => {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [newTenant, setNewTenant] = useState<string>("");
  const [editingTenant, setEditingTenant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showMobileForm, setShowMobileForm] = useState<boolean>(false);

  // Filtrer les tenants selon la recherche
  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Charger les tenants
  useEffect(() => {
    const fetchTenants = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get("/tenant");
        if (Array.isArray(response.data.data)) {
          setTenants(response.data.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tenants:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  // Ajouter un tenant
  const handleAddTenant = async (e?: React.FormEvent | React.KeyboardEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!newTenant.trim()) {
      toast.error("Le nom du tenant est requis");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/tenant", { name: newTenant.trim() });

      const newTenantObj: TenantDto = {
        id: Date.now().toString(),
        name: newTenant.trim(),
        createdAt: new Date().toISOString(),
        userCount: 0,
      };
      setTenants((prev) => [...prev, newTenantObj]);
      setNewTenant("");
      setShowMobileForm(false);
      toast.success("Tenant créé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la création du tenant:", error);
      toast.error("Erreur lors de la création du tenant");
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier un tenant
  const handleUpdateTenant = async (id: string, newName: string): Promise<void> => {
    if (!newName.trim()) {
      toast.error("Le nom du tenant est requis");
      return;
    }
    try {
      await api.patch(`/tenant/${id}`, { name: newName.trim() });
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === id ? { ...tenant, name: newName.trim() } : tenant
        )
      );
      setEditingTenant(null);
      toast.success("Tenant modifié avec succès!");
    } catch (error) {
      console.error("Erreur lors de la modification du tenant:", error);
      toast.error("Erreur lors de la modification du tenant");
    }
  };

  // Supprimer un tenant
  const handleDeleteTenant = async (id: string, name: string): Promise<void> => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le tenant "${name}" ?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/tenant/${id}`);
      setTenants((prev) => prev.filter((tenant) => tenant.id !== id));
      toast.success("Tenant supprimé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la suppression du tenant:", error);
      toast.error("Erreur lors de la suppression du tenant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header fixe responsive */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Section gauche */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex-shrink-0">
                <button className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Retour</span>
                </button>
              </Link>
              
              <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                    <span className="hidden sm:inline">Administration des </span>Tenants
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Gestion centralisée des espaces
                  </p>
                </div>
              </div>
            </div>

            {/* Section droite */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                <span className="text-xs font-medium text-blue-800">
                  {tenants.length} tenant{tenants.length !== 1 ? "s" : ""}
                </span>
              </div>
              
              {/* Bouton mobile pour afficher le formulaire */}
              <button
                onClick={() => setShowMobileForm(!showMobileForm)}
                className="lg:hidden inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nouveau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Formulaire de création - Sidebar sur desktop, modal sur mobile */}
          <div className={`lg:col-span-1 ${showMobileForm ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <h2 className="text-sm sm:text-lg font-bold text-white">
                      Nouveau tenant
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowMobileForm(false)}
                    className="lg:hidden p-1 text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label
                    htmlFor="tenant-name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nom du tenant <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tenant-name"
                    type="text"
                    value={newTenant}
                    onChange={(e) => setNewTenant(e.target.value)}
                    placeholder="Saisir le nom du tenant"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm sm:text-base"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTenant(e);
                      }
                    }}
                  />
                </div>
                
                <button
                  onClick={handleAddTenant}
                  disabled={submitting || !newTenant.trim()}
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-semibold rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer le tenant
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Liste des tenants */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              
              {/* Header de la liste avec recherche */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Liste des tenants
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""} trouvé{filteredTenants.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  
                  {/* Barre de recherche */}
                  <div className="relative max-w-sm w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un tenant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contenu de la liste */}
              <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                {filteredTenants.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredTenants.map((tenant, index) => (
                      <div
                        key={tenant.id}
                        className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {/* Avatar numéroté */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-xs sm:text-sm font-bold text-white">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            
                            {/* Informations du tenant */}
                            <div className="min-w-0 flex-1">
                              {editingTenant?.id === tenant.id ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editingTenant.name}
                                    onChange={(e) =>
                                      setEditingTenant({
                                        ...editingTenant,
                                        name: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  />
                                  <button
                                    onClick={() =>
                                      handleUpdateTenant(
                                        tenant.id,
                                        editingTenant.name
                                      )
                                    }
                                    className="p-1.5 sm:p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingTenant(null)}
                                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                    {tenant.name}
                                  </h3>
                                  
                                  {/* Métadonnées responsive */}
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs font-mono text-gray-600 rounded-full">
                                      ID: {tenant.id.slice(0, 8)}...
                                    </span>
                                    
                                    {tenant.userCount !== undefined && (
                                      <span className="inline-flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                        <Users className="h-3 w-3 mr-1" />
                                        {tenant.userCount} user{tenant.userCount !== 1 ? "s" : ""}
                                      </span>
                                    )}
                                    
                                    {tenant.createdAt && (
                                      <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span className="hidden sm:inline">Créé le </span>
                                        {new Date(tenant.createdAt).toLocaleDateString("fr-FR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit"
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          {editingTenant?.id !== tenant.id && (
                            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                              <button
                                onClick={() =>
                                  setEditingTenant({
                                    id: tenant.id,
                                    name: tenant.name,
                                  })
                                }
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteTenant(tenant.id, tenant.name)
                                }
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? "Aucun résultat trouvé" : "Aucun tenant"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto">
                      {searchTerm 
                        ? `Aucun tenant ne correspond à "${searchTerm}"`
                        : "Commencez par créer votre premier tenant pour démarrer."
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;