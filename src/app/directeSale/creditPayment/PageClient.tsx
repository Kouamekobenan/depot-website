"use client";
import api, { formatDate } from "@/app/prisma/api";
import { directSaleDto } from "@/app/types/type";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  CreditCard,
  User,
  Calendar,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  SwissFranc,
  X,
} from "lucide-react";
import { handleBack } from "@/app/types/handleApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
interface CreditPaymentForm {
  directSaleId: string;
  amount: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSale: directSaleDto | null;
  creditPayment: CreditPaymentForm;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedSale,
  creditPayment,
  onAmountChange,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen || !selectedSale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Paiement de crédit
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            <span className="font-medium">Client:</span>{" "}
            {selectedSale.customer.name}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Montant restant:</span>{" "}
            <span className="text-red-600 font-semibold">
              {selectedSale.dueAmount.toLocaleString()} F
            </span>
          </p>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Montant à payer
            </label>
            <input
              id="amount"
              type="text"
              value={creditPayment.amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </>
            ) : (
              "Confirmer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default function PageClientCredit() {
  const [sales, setSales] = useState<directSaleDto[]>([]);
  const [filteredSales, setFilteredSales] = useState<directSaleDto[]>([]);
  const [errors, setErrors] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSale, setSelectedSale] = useState<directSaleDto | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isSubmittingPayment, setIsSubmittingPayment] =
    useState<boolean>(false);
  const router = useRouter();
  const limit = 10;
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [creditPayment, setCreditPayment] = useState<CreditPaymentForm>({
    directSaleId: "",
    amount: "",
  });
  // Validation du formulaire de paiement
  const validatePaymentForm = useCallback(
    (amount: string, saleId?: string): string | null => {
      if (!amount || amount.trim() === "") {
        return "Veuillez saisir le montant";
      }

      const numericAmount = Number(amount);
      if (isNaN(numericAmount)) {
        return "Le montant doit être un nombre valide!";
      }
      if (numericAmount <= 0) {
        return "Le montant doit être supérieur à zéro!";
      }

      if (selectedSale && numericAmount > selectedSale.dueAmount) {
        return "Le montant ne peut pas dépasser le montant dû!";
      }

      if (!saleId) {
        return "L'ID de la vente est manquant!";
      }

      return null;
    },
    [selectedSale]
  );
  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setErrors(""); // Reset errors

      const result = await api.get(`/directeSale/credit/${tenantId}`, {
        params: {
          limit,
          page: currentPage,
        },
      });
      if (result.data && Array.isArray(result.data.data)) {
        setSales(result.data.data);
        setTotalPages(result.data.totalPages || 1);
      } else {
        throw new Error("Format de données invalide");
      }
    } catch (error: unknown) {
      console.error("API Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrors(`Erreur lors du chargement des crédits: ${errorMessage}`);
      setSales([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, tenantId]);

  // Gestion des paiements avec validation améliorée
  const handleCreatePayment = useCallback(async () => {
    const validationError = validatePaymentForm(
      creditPayment.amount,
      selectedSale?.id
    );

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmittingPayment(true);

    try {
      await api.post("/creditPayment", {
        directSaleId: selectedSale?.id,
        amount: Number(creditPayment.amount),
      });
      toast.success("Crédit payé avec succès!");
      // Réinitialiser le formulaire et fermer le modal
      setCreditPayment({
        directSaleId: "",
        amount: "",
      });
      setShowPaymentModal(false);
      setSelectedSale(null);

      // Recharger les données pour refléter les changements
      await fetchSales();
      router.push(`/print/${selectedSale?.id}`);
    } catch (error: unknown) {
      console.error("Payment creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrors(
        `Erreur lors de la création du paiement crédit: ${errorMessage}`
      );
      toast.error("Échec de la création du paiement crédit");
    } finally {
      setIsSubmittingPayment(false);
    }
  }, [
    fetchSales,
    creditPayment.amount,
    selectedSale?.id,
    validatePaymentForm,
    router, // ajouté
  ]);

  // Amélioration de la gestion des montants
  const handleAmountChange = useCallback((value: string): void => {
    // Nettoyage de la valeur (permet seulement les nombres et points/virgules)
    const cleanedValue = value.replace(/[^0-9.,]/g, "").replace(",", ".");

    // Éviter les points/virgules multiples
    const parts = cleanedValue.split(".");
    const finalValue =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : cleanedValue;

    setCreditPayment((prev) => ({
      ...prev,
      amount: finalValue,
    }));
  }, []);

  // Filtrage des ventes avec debouncing amélioré
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setFilteredSales(sales);
      } else {
        const filtered = sales.filter((sale) =>
          sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSales(filtered);
      }
    }, 300); // Debouncing de 300ms

    return () => clearTimeout(timeoutId);
  }, [sales, searchTerm]);

  // Fonction de récupération des données extraite et améliorée

  // Récupération des données
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Calculs des statistiques avec gestion d'erreur
  const statistics = useMemo(() => {
    try {
      const totalCredits = filteredSales.length;
      const totalAmount = filteredSales.reduce(
        (sum, sale) => sum + (sale.totalPrice || 0),
        0
      );
      const totalPaid = filteredSales.reduce(
        (sum, sale) => sum + (sale.amountPaid || 0),
        0
      );
      const totalDue = filteredSales.reduce(
        (sum, sale) => sum + (sale.dueAmount || 0),
        0
      );

      return { totalCredits, totalAmount, totalPaid, totalDue };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      return { totalCredits: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 };
    }
  }, [filteredSales]);

  // Gestion optimisée des clics de paiement
  const handlePaymentClick = useCallback((sale: directSaleDto) => {
    setSelectedSale(sale);
    setCreditPayment((prev) => ({
      ...prev,
      directSaleId: sale.id,
    }));
    setShowPaymentModal(true);
  }, []);

  // Fonction de statut de paiement améliorée
  const getPaymentStatus = useCallback((sale: directSaleDto) => {
    if (!sale.totalPrice || sale.totalPrice === 0) {
      return {
        status: "error",
        label: "Erreur",
        color: "text-gray-600 bg-gray-100",
      };
    }

    const percentage = (sale.amountPaid / sale.totalPrice) * 100;

    if (percentage >= 100) {
      return {
        status: "paid",
        label: "Payé",
        color: "text-green-600 bg-green-100",
      };
    }

    if (percentage >= 50) {
      return {
        status: "partial",
        label: "Partiellement payé",
        color: "text-orange-600 bg-orange-100",
      };
    }

    return {
      status: "unpaid",
      label: "Non payé",
      color: "text-red-600 bg-red-100",
    };
  }, []);

  // Gestion de la fermeture du modal
  const handleCloseModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedSale(null);
    setCreditPayment({
      directSaleId: "",
      amount: "",
    });
  }, []);

  // Gestion de la pagination
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des crédits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="bg-gray-600 p-1 text-white rounded-md cursor-pointer hover:bg-gray-700 transition-colors"
                  aria-label="Retour"
                >
                  <ArrowLeft />
                </button>
                <CreditCard className="h-8 w-8 text-orange-600" />
                Gestion des Crédits Client
              </h1>
              <p className="text-gray-600 mt-2">
                Suivi et gestion des paiements en crédit
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Crédits
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalCredits}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-300 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Montant Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalAmount.toLocaleString()} F
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-300 rounded-lg flex items-center justify-center">
                <SwissFranc className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Montant Payé
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.totalPaid.toLocaleString()} F
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-300 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reste à Payer
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.totalDue.toLocaleString()} F
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-300 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur */}
        {errors && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des crédits */}
        <div className="space-y-6">
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun crédit trouvé</p>
              {searchTerm && (
                <p className="text-gray-400 mt-2">
                  Aucun résultat pour: ``{searchTerm}``
                </p>
              )}
            </div>
          ) : (
            filteredSales.map((sale) => {
              const paymentStatus = getPaymentStatus(sale);
              const paymentPercentage =
                sale.totalPrice > 0
                  ? (sale.amountPaid / sale.totalPrice) * 100
                  : 0;

              return (
                <div
                  key={sale.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* En-tête du crédit */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-orange-300 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {sale.customer.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Dernière mise à jour: {formatDate(sale.updatedAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                        {sale.dueAmount > 0 && (
                          <button
                            onClick={() => handlePaymentClick(sale)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Payer le crédit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Détails financiers */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Montant Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {sale.totalPrice.toLocaleString()} F
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Montant Payé</p>
                        <p className="text-2xl font-bold text-green-600">
                          {sale.amountPaid.toLocaleString()} F
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Reste à Payer</p>
                        <p className="text-2xl font-bold text-red-600">
                          {sale.dueAmount.toLocaleString()} F
                        </p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progression du paiement</span>
                        <span>{Math.round(paymentPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(paymentPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Liste des produits */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5 text-gray-600" />
                        <h4 className="text-lg font-medium text-gray-900">
                          Liste des Produits ({sale.saleItems?.length || 0})
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantité
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prix Unitaire
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prix Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sale.saleItems?.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {item.unitPrice?.toLocaleString() || "0"} F
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">
                                    {item.totalPrice?.toLocaleString() || "0"} F
                                  </span>
                                </td>
                              </tr>
                            )) || (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-6 py-4 text-center text-gray-500"
                                >
                                  Aucun produit trouvé
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>

              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleCloseModal}
        selectedSale={selectedSale}
        creditPayment={creditPayment}
        onAmountChange={handleAmountChange}
        onSubmit={handleCreatePayment}
        isSubmitting={isSubmittingPayment}
      />
    </div>
  );
}
