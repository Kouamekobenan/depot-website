"use client";
import api from "@/app/prisma/api";
import { directSaleDto } from "@/app/types/type";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Search, CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import { handleBack } from "@/app/types/handleApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import CreditStatistics from "./component/CreditStatistics";
import CreditListCard from "./component/CreditListCard";
import CreditPaymentModal from "./component/CreditPaymentModal";
// Import des nouveaux composants

// Renommé pour la clarté (était CreditPaymentForm)
interface CreditPaymentData {
  directSaleId: string;
  amount: string;
}

// Fonction de configuration des statuts (plus robuste)
const PAYMENT_STATUSES = {
  paid: {
    status: "paid",
    label: "Payé",
    color: "text-green-700 bg-green-100",
  },
  partial: {
    status: "partial",
    label: "Partiellement payé",
    color: "text-orange-700 bg-orange-100",
  },
  unpaid: {
    status: "unpaid",
    label: "Non payé",
    color: "text-red-700 bg-red-100",
  },
  error: {
    status: "error",
    label: "Erreur",
    color: "text-gray-600 bg-gray-100",
  },
};

export default function PageClientCredit() {
  // --- ÉTATS ---
  const [sales, setSales] = useState<directSaleDto[]>([]);
  const [errors, setErrors] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedSale, setSelectedSale] = useState<directSaleDto | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isSubmittingPayment, setIsSubmittingPayment] =
    useState<boolean>(false);
  const [creditPayment, setCreditPayment] = useState<CreditPaymentData>({
    directSaleId: "",
    amount: "",
  });

  const router = useRouter();
  const limit = 10;
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // --- LOGIQUE / HOOKS UTILITAIRES ---

  // 1. Calculs des statistiques (useMemo)
  const statistics = useMemo(() => {
    // Filtrage simple et rapide des crédits non payés pour l'affichage initial
    const creditsToDisplay = sales.filter((s) => s.dueAmount > 0);
    try {
      const totalCredits = creditsToDisplay.length;
      const totalAmount = creditsToDisplay.reduce(
        (sum, sale) => sum + (sale.totalPrice || 0),
        0
      );
      const totalPaid = creditsToDisplay.reduce(
        (sum, sale) => sum + (sale.amountPaid || 0),
        0
      );
      const totalDue = creditsToDisplay.reduce(
        (sum, sale) => sum + (sale.dueAmount || 0),
        0
      );

      return { totalCredits, totalAmount, totalPaid, totalDue };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      return { totalCredits: 0, totalAmount: 0, totalPaid: 0, totalDue: 0 };
    }
  }, [sales]);

  // 2. Gestion du filtrage (useMemo avec useEffect pour debouncing)
  const filteredSales = useMemo(() => {
    if (searchTerm.trim() === "") {
      return sales;
    }
    return sales.filter((sale) =>
      sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]); // Pas de debouncing ici, il est géré dans l'input (ou peut être ajouté avec un hook debounce si préféré)

  // 3. Fonction de récupération des données (useCallback)
  const fetchSales = useCallback(async () => {
    if (!tenantId) {
      setErrors("ID locataire manquant. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErrors("");

      const result = await api.get(`/directeSale/credit/${tenantId}`, {
        params: { limit, page: currentPage },
      });
      if (result.data && Array.isArray(result.data.data)) {
        // Filtrer côté client pour n'afficher que les crédits actifs (dueAmount > 0)
        const activeCredits = result.data.data.filter(
          (sale: directSaleDto) => (sale.dueAmount || 0) > 0
        );
        setSales(activeCredits);
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

  // 4. Validation du formulaire de paiement (useCallback)
  const validatePaymentForm = useCallback(
    (amount: string): string | null => {
      if (!amount || amount.trim() === "") {
        return "Veuillez saisir le montant.";
      }

      const numericAmount = Number(amount.replace(",", "."));
      if (isNaN(numericAmount)) {
        return "Le montant doit être un nombre valide!";
      }
      if (numericAmount <= 0) {
        return "Le montant doit être supérieur à zéro!";
      }

      if (selectedSale && numericAmount > selectedSale.dueAmount) {
        return "Le montant ne peut pas dépasser le montant dû!";
      }
      if (!selectedSale?.id) {
        return "L'ID de la vente est manquant!";
      }

      return null;
    },
    [selectedSale]
  );

  // 5. Gestion de la soumission de paiement (useCallback)
  const handleCreatePayment = useCallback(async () => {
    const validationError = validatePaymentForm(creditPayment.amount);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmittingPayment(true);

    try {
      const amountToSend = Number(creditPayment.amount.replace(",", "."));
      await api.post("/creditPayment", {
        directSaleId: selectedSale?.id,
        amount: amountToSend,
      });

      toast.success("Crédit payé avec succès!");
      handleCloseModal(); // Fermer et réinitialiser
      await fetchSales(); // Recharger les données

      // Optionnel: Redirection pour impression après paiement réussi
      if (selectedSale?.id) {
        router.push(`/print/${selectedSale.id}`);
      }
    } catch (error: unknown) {
      console.error("Payment creation error:", error);
      toast.error("Échec de la création du paiement crédit.");
    } finally {
      setIsSubmittingPayment(false);
    }
  }, [
    fetchSales,
    creditPayment.amount,
    selectedSale?.id,
    validatePaymentForm,
    router,
  ]);

  // 6. Gestion du changement de montant (useCallback)
  const handleAmountChange = useCallback((value: string): void => {
    // Permet nombres et un seul point/virgule
    const cleanedValue = value.replace(/[^0-9.,]/g, "");
    const parts = cleanedValue.split(/[.,]/);
    const finalValue =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : cleanedValue;

    setCreditPayment((prev) => ({
      ...prev,
      amount: finalValue.replace(",", "."), // Normaliser en point pour le moteur JS
    }));
  }, []);

  // 7. Gestion de l'ouverture du modal (useCallback)
  const handlePaymentClick = useCallback((sale: directSaleDto) => {
    setSelectedSale(sale);
    setCreditPayment((prev) => ({
      ...prev,
      directSaleId: sale.id,
      amount: sale.dueAmount.toFixed(2), // Pré-remplir avec le montant dû
    }));
    setShowPaymentModal(true);
  }, []);

  // 8. Gestion de la fermeture du modal (useCallback)
  const handleCloseModal = useCallback(() => {
    setShowPaymentModal(false);
    setSelectedSale(null);
    setCreditPayment({
      directSaleId: "",
      amount: "",
    });
  }, []);

  // 9. Fonction de statut de paiement (useCallback)
  const getPaymentStatus = useCallback((sale: directSaleDto) => {
    if (!sale.totalPrice || sale.totalPrice === 0) {
      return PAYMENT_STATUSES.error;
    }

    const percentage = (sale.amountPaid / sale.totalPrice) * 100;

    if (percentage >= 100) {
      return PAYMENT_STATUSES.paid;
    }
    if (percentage >= 50) {
      return PAYMENT_STATUSES.partial;
    }

    return PAYMENT_STATUSES.unpaid;
  }, []);

  // 10. Gestion de la pagination (useCallback)
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // --- EFFETS ---
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // --- RENDU ---

  // Rendu de l'état de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">
            Chargement des crédits en cours...
          </p>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête (Titre, Retour, Recherche) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="bg-gray-600 p-2 text-white rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-orange-700" />
                Gestion des Crédits Client
              </h1>
            </div>

            {/* Barre de recherche améliorée */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none"
              />
            </div>
          </div>
          <p className="text-gray-600 mt-2 ml-14">
            Suivi et gestion des paiements en crédit
          </p>
        </div>
        {/* --- FIN EN-TÊTE --- */}

        {/* Statistiques (Composant séparé) */}
        <CreditStatistics statistics={statistics} />

        {/* Messages d'erreur */}
        {errors && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errors}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des crédits */}
        <div className="space-y-6">
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center border-2 border-dashed border-gray-300">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-xl font-semibold">
                Aucun crédit en cours
              </p>
              {searchTerm && (
                <p className="text-gray-500 mt-2">
                  Aucun résultat pour: **{searchTerm}**
                </p>
              )}
            </div>
          ) : (
            filteredSales.map((sale) => (
              <CreditListCard
                key={sale.id}
                sale={sale}
                getPaymentStatus={getPaymentStatus}
                handlePaymentClick={handlePaymentClick}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10">
            <nav className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Précédent
              </button>

              <span className="px-4 py-2 text-base font-bold text-orange-700 bg-orange-100 rounded-xl">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Suivant
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modal de paiement (Composant séparé) */}
      <CreditPaymentModal
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
