import React from "react";
import { User, Calendar, Package, CreditCard } from "lucide-react";
import { directSaleDto } from "@/app/types/type";
import { formatDate } from "@/app/prisma/api";

interface PaymentStatus {
  status: string;
  label: string;
  color: string;
}

interface CreditListCardProps {
  sale: directSaleDto;
  getPaymentStatus: (sale: directSaleDto) => PaymentStatus;
  handlePaymentClick: (sale: directSaleDto) => void;
}

const CreditListCard: React.FC<CreditListCardProps> = ({
  sale,
  getPaymentStatus,
  handlePaymentClick,
}) => {
  const paymentStatus = getPaymentStatus(sale);
  const paymentPercentage =
    sale.totalPrice > 0 ? (sale.amountPaid / sale.totalPrice) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* En-tête du crédit */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-7 w-7 text-orange-700" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {sale.customer.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  Dernière MAJ: {formatDate(sale.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${paymentStatus.color}`}
            >
              {paymentStatus.label}
            </span>
            {sale.dueAmount > 0 && (
              <button
                onClick={() => handlePaymentClick(sale)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition-colors font-semibold shadow-md flex items-center gap-2 disabled:bg-gray-400"
              >
                <CreditCard className="h-5 w-5" />
                Payer le crédit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Détails financiers */}
      <div className="p-6">
        {/* Grille des montants */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <AmountBox
            label="Montant Total"
            value={sale.totalPrice}
            color="text-gray-900"
          />
          <AmountBox
            label="Montant Payé"
            value={sale.amountPaid}
            color="text-green-600"
          />
          <AmountBox
            label="Reste à Payer"
            value={sale.dueAmount}
            color="text-red-600"
          />
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Progression du paiement</span>
            <span>{Math.round(paymentPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(paymentPercentage, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-gray-700" />
            <h4 className="text-lg font-bold text-gray-900">
              Détail des Produits ({sale.saleItems?.length || 0})
            </h4>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Produit ID</Th>
                  <Th>Quantité</Th>
                  <Th>Prix Unitaire</Th>
                  <Th>Prix Total</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sale.saleItems?.length > 0 ? (
                  sale.saleItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-orange-50/50 transition-colors"
                    >
                      <Td className="font-medium">{item.id}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>{item.unitPrice?.toLocaleString() || "0"} F</Td>
                      <Td className="font-bold">
                        {item.totalPrice?.toLocaleString() || "0"} F
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <Td  className="text-center text-gray-500">
                      Aucun produit trouvé
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants utilitaires pour la lisibilité
const AmountBox: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
    <p className="text-sm text-gray-600 font-medium">{label}</p>
    <p className={`text-3xl font-extrabold mt-1 ${color}`}>
      {value.toLocaleString()} F
    </p>
  </div>
);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}
  >
    {children}
  </td>
);

export default CreditListCard;
