import React from "react";
import { CreditCard, User, SwissFranc, X } from "lucide-react";
import { directSaleDto } from "@/app/types/type";

// Renommé et ajusté pour la clarté
interface CreditPaymentData {
  directSaleId: string;
  amount: string;
}

interface CreditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSale: directSaleDto | null;
  creditPayment: CreditPaymentData;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CreditPaymentModal: React.FC<CreditPaymentModalProps> = ({
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-orange-700" />
            Paiement de Crédit
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 mb-8">
          {/* Bloc d'informations Client et Montant Dû */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <p className="text-gray-700 font-medium">Client:</p>
              <p className="text-gray-900 font-semibold truncate">
                {selectedSale.customer.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SwissFranc className="h-5 w-5 text-red-600" />
              <p className="text-gray-700 font-medium">Montant dû:</p>
              <p className="text-red-700 font-bold text-xl">
                {selectedSale.dueAmount.toLocaleString()} F
              </p>
            </div>
          </div>

          {/* Champ Montant à payer */}
          <div>
            <label
              htmlFor="amount"
              className="block text-lg font-semibold text-gray-800 mb-2"
            >
              Montant à payer
            </label>
            <div className="relative">
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={creditPayment.amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-4 pr-12 py-3 border-2 border-gray-300 rounded-xl text-xl font-mono focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all outline-none"
                disabled={isSubmitting}
                autoFocus
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-500">
                F
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || creditPayment.amount.trim() === ""}
            className="flex-1 px-4 py-3 bg-orange-700 text-white rounded-xl hover:bg-orange-800 transition-colors font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Traitement...
              </>
            ) : (
              "Confirmer le Paiement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreditPaymentModal;
