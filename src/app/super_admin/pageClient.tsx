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
// Simuler les imports manquants
const SuperAdmin = () => {
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [newTenant, setNewTenant] = useState("");
  const [editingTenant, setEditingTenant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Charger les tenants
  useEffect(() => {
    const fetchTenants = async () => {
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
  const handleAddTenant = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!newTenant.trim()) {
      toast.error("Le nom du tenant est requis");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/tenant", { name: newTenant.trim() });

      // Ajouter localement pour une UX fluide
      const newTenantObj: TenantDto = {
        id: Date.now().toString(),
        name: newTenant.trim(),
        createdAt: new Date().toISOString(),
        userCount: 0,
      };
      setTenants((prev) => [...prev, newTenantObj]);
      setNewTenant("");
      toast.success("Tenant créé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la création du tenant:", error);
      toast.error("Erreur lors de la création du tenant");
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier un tenant
  const handleUpdateTenant = async (id: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Le nom du tenant est requis");
      return;
    }
    try {
      await api.patch(`/tenant/${id}`, { name: newName.trim() });
      // Mettre à jour localement
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
  const handleDeleteTenant = async (id: string, name: string) => {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="bg-gray-100 cursor-pointer rounded-md">
                <button className="inline-flex items-center px-3 py-2 text-sm cursor-pointer font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Administration des Tenants
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {tenants.length} tenant{tenants.length > 1 ? "s" : ""} configuré
              {tenants.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de création */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Plus className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-serif font-bold text-gray-900">
                  Créer un nouveau tenant
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="tenant-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nom du tenant
                  </label>
                  <input
                    id="tenant-name"
                    type="text"
                    value={newTenant}
                    onChange={(e) => setNewTenant(e.target.value)}
                    placeholder="Saisir le nom du tenant"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full inline-flex justify-center items-center px-4 py-2 border 
                  border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Liste des tenants
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {tenants.length > 0 ? (
                  tenants.map((tenant, index) => (
                    <div
                      key={tenant.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {index + 1}
                              </span>
                            </div>
                          </div>
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
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <button
                                  onClick={() =>
                                    handleUpdateTenant(
                                      tenant.id,
                                      editingTenant.name
                                    )
                                  }
                                  className="p-1 text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingTenant(null)}
                                  className="p-1 text-gray-400 hover:text-gray-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                  {tenant.name}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>ID: {tenant.id}</span>
                                  {tenant.userCount !== undefined && (
                                    <span className="flex items-center">
                                      <Users className="h-3 w-3 mr-1" />
                                      {tenant.userCount} utilisateur
                                      {tenant.userCount > 1 ? "s" : ""}
                                    </span>
                                  )}
                                  {tenant.createdAt && (
                                    <span>
                                      Créé le{" "}
                                      {new Date(
                                        tenant.createdAt
                                      ).toLocaleDateString("fr-FR")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {editingTenant?.id !== tenant.id && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                setEditingTenant({
                                  id: tenant.id,
                                  name: tenant.name,
                                })
                              }
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTenant(tenant.id, tenant.name)
                              }
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Aucun tenant
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par créer votre premier tenant.
                    </p>
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
