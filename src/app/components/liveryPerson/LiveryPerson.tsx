"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import api from "@/app/prisma/api";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Phone,
  X,
  Search,
  Filter,
  Trash,
  Eye,
  SquarePen,
} from "lucide-react";
import { Button } from "../forms/Button";
import { deliveryPersonDto } from "@/app/types/type";
import toast from "react-hot-toast/headless";
import { FormLivModal } from "./FormLiv";
import { useAuth } from "@/app/context/AuthContext";

const ITEMS_PER_PAGE = 5;

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

interface Intem {
  onClick?: () => void;
}

export const LiveryPerson: React.FC<Intem> = ({ onClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [selectedLivreur, setSelectedLivreur] =
    useState<deliveryPersonDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const [deliveryPersons, setDeliveryPersons] = useState<deliveryPersonDto[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  // Delete deliveryPerson
  const handleDelete = async (id: string) => {
    // 1. Confirmation avant suppression
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible."
    );

    if (!confirmDelete) return;

    // 2. État de chargement pour l'action spécifique
    setLoadingState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 3. Appel API pour supprimer
      await api.delete(`/deliveryPerson/${id}`);
      // 4. Mettre à jour l'état local immédiatement
      setDeliveryPersons((prev) => prev.filter((person) => person.id !== id));

      // 5. Nettoyer la sélection si l'élément supprimé était sélectionné
      setCheckedItems((prev) => prev.filter((itemId) => itemId !== id));

      // 6. Message de succès
      toast.success("Le livreur a été supprimé avec succès !");

      // 7. Ajuster la pagination si nécessaire
      const newFilteredData = deliveryPersons.filter(
        (person) => person.id !== id
      );
      const newTotalPages = Math.ceil(newFilteredData.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression du livreur:", error);

      // 8. Gestion d'erreur appropriée
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le livreur";

      setLoadingState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      toast.error("Erreur lors de la suppression du livreur");
    } finally {
      // 9. Arrêter le chargement
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSuccess = () => {
    // Tu peux déclencher un refetch ici via un état global, un context ou props vers <Fournisseur />
    handleCloseModal();
  };
  // Filtrer les données selon le terme de recherche
  const filteredData = deliveryPersons.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
    setCheckedItems((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (checkedItems.length === currentData.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(currentData.map((item) => item.id));
    }
  }, [checkedItems.length, currentData]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const clearSelection = useCallback(() => {
    setCheckedItems([]);
  }, []);

  const fetchDeliveryPersons = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null });
    try {
      const response = await api.get(`/deliveryPerson/${tenantId}`);
      setDeliveryPersons(response.data);
    } catch (error: unknown) {
      console.error("Erreur lors du chargement des livreurs:", error);
      setLoadingState((prev) => ({
        ...prev,
        error: "Impossible de charger les données des livreurs",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDeliveryPersons();
  }, [fetchDeliveryPersons]);

  // Reset page when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Effect pour gérer l'état indeterminate du checkbox "Tout sélectionner"
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate =
        checkedItems.length > 0 && checkedItems.length < currentData.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [checkedItems.length, currentData.length]);

  if (loadingState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-600 font-medium">
            Chargement des livreurs...
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = (fournisseur: deliveryPersonDto) => {
    setSelectedLivreur(fournisseur);
    setIsModalOpen(true);
  };

  return (
    <div className="relative bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-3">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Livreurs
                </h1>
                <p className="text-gray-600">
                  {deliveryPersons.length} livreur(s) enregistré(s)
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <Button
                onClick={onClick}
                label="Nouveau Livreur"
                className="bg-orange-600 hover:bg-orange-700 border-0 text-white font-medium px-2 py-1.5 rounded-lg shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error State */}
        {loadingState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{loadingState.error}</p>
            <button
              onClick={fetchDeliveryPersons}
              className="mt-2 text-red-600 hover:text-red-800 font-medium underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 items-center px-6 py-4">
              <div className="col-span-1">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  onChange={handleSelectAll}
                  checked={
                    checkedItems.length === currentData.length &&
                    currentData.length > 0
                  }
                />
              </div>
              <div className="col-span-4 flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Nom du Livreur
                </span>
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Téléphone
                </span>
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-700">
                Statut
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-700 text-center">
                Actions
              </div>
            </div>
          </div>
          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentData.length ? (
              currentData.map((person) => (
                <div
                  key={person.id}
                  className={`grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-150 ${
                    checkedItems.includes(person.id)
                      ? "bg-blue-50 border-l-4 border-l-orange-500"
                      : ""
                  }`}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      onChange={(e) =>
                        handleCheckboxChange(person.id, e.target.checked)
                      }
                      checked={checkedItems.includes(person.id)}
                    />
                  </div>

                  <div className="col-span-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {person.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {person.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-900 font-medium">{person.phone}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-center space-x-2">
                    <article className="flex gap-2">
                      <Link
                        href={`/performante/${person.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-orange-100 hover:bg-amber-100 text-amber-700 rounded-md text-sm font-medium transition-colors duration-200 space-x-1"
                      >
                        {/* <History className="h-3 w-3" /> */}
                        <Eye className="h-3 w-3" />
                        <span>Révenu</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(person.id)}
                        className=" px-3 py-1.5 text-orange-600 cursor-pointer  bg-gray-300 rounded-full"
                      >
                        {" "}
                        <Trash className="" />
                      </button>
                      <button
                        onClick={() => handleEdit(person)}
                        className=" px-3 py-1.5 text-orange-600 cursor-pointer  bg-blue-100 rounded-full"
                      >
                        {" "}
                        <SquarePen className="" />
                      </button>
                    </article>
                  </div>
                  <FormLivModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode="edit"
                    existingPerson={selectedLivreur}
                    onSuccess={handleSuccess}
                  />
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm
                    ? "Aucun résultat trouvé"
                    : "Aucun livreur enregistré"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Essayez de modifier votre recherche"
                    : "Commencez par ajouter votre premier livreur"}
                </p>
                {!searchTerm && (
                  <Button
                    label="Ajouter un Livreur"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}{" "}
                  sur {filteredData.length} résultat(s)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            currentPage === pageNum
                              ? "bg-orange-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Side Panel for Bulk Actions */}
      {checkedItems.length > 0 && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={clearSelection}
          />

          {/* Side Panel */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Actions groupées
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {checkedItems.length} élément(s) sélectionné(s)
                </p>
              </div>
              <button
                onClick={clearSelection}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Panel Body */}
            <div className="flex-1 p-6 space-y-4">
              <Button
                label="Ajouter au groupe"
                className="w-full bg-blue-50 hover:bg-blue-100 text-orange-700 rounded-lg font-medium transition-colors duration-200"
              />

              <Button
                label="Modifier en lot"
                className="w-full bg-amber-50 hover:bg-amber-100 text-orange-600 rounded-lg font-medium transition-colors duration-200"
              />

              <Button
                label="Supprimer"
                className="w-full bg-red-50 hover:bg-red-100 text-orange-600 rounded-lg font-medium transition-colors duration-200"
              />
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t border-gray-200">
              <Button
                onClick={clearSelection}
                label="Annuler la sélection"
                className="w-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
