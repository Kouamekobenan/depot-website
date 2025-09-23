"use client";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/prisma/api";
import { Users, Check, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  tenantId: string;
}

export default function NewClientPage() {
  const { user } = useAuth();
  const router = useRouter();
  const tenantId = user?.tenantId;

  const [clientForm, setClientForm] = useState<ClientFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    tenantId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !clientForm.name ||
      !clientForm.phone ||
      !clientForm.email ||
      !clientForm.address
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/customer", {
        ...clientForm,
        tenantId: tenantId,
      });

      toast.success("Client créé avec succès!");

      // Rediriger vers la page précédente avec les données du nouveau client
      const newClient = response.data;

      // Option 1: Redirection simple vers la page de vente
      //   router.push("/direct-sale");

      // Option 2: Si vous voulez passer les données du client créé, vous pouvez utiliser sessionStorage
      sessionStorage.setItem("newClient", JSON.stringify(newClient));
      router.push("/directeSale/create");
    } catch (error) {
      console.error("Erreur lors de la création du client", error);
      toast.error("Erreur lors de la création du client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-orange-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nouveau Client
                </h1>
                <p className="text-gray-600">
                  Créer un nouveau client pour vos ventes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleClientSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientForm.name}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="+2250700000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="jean.dupont@example.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={clientForm.address}
                  onChange={(e) =>
                    setClientForm({
                      ...clientForm,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                  rows={4}
                  placeholder="Abidjan, Cocody Riviera"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !clientForm.name ||
                  !clientForm.phone ||
                  !clientForm.email ||
                  !clientForm.address
                }
                className="w-full sm:w-auto bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Créer le client</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Information</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Une fois le client créé, vous serez redirigé vers la page de
                  vente où vous pourrez sélectionner ce nouveau client pour vos
                  transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
