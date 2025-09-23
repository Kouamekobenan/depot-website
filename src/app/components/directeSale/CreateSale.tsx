"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api, { formatDate } from "@/app/prisma/api";
import { customerDto, productItems } from "@/app/types/type";
import Select, { SingleValue } from "react-select";
import {
  Plus,
  User,
  CreditCard,
  DollarSign,
  X,
  Check,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { handleBack } from "@/app/types/handleApi";
import { useRouter } from "next/navigation";
import { StylesConfig, GroupBase, CSSObjectWithLabel } from "react-select";

interface ProductOption {
  value: string;
  label: string;
  stock: number;
  unitPrice: number;
}

interface CustomerOption {
  value: string;
  label: string;
  customer: customerDto;
}

interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Types pour les styles de react-select
interface SelectState {
  isSelected: boolean;
  isFocused: boolean;
  isDisabled?: boolean;
}

export default function DirectSaleForm() {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id;
  const tenantId = user?.tenantId;
  const userName = user?.name;
  const [customerId, setCustomerId] = useState("");
  const [isCredit, setIsCredit] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [productList, setProductList] = useState<productItems[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);
  const [customers, setCustomers] = useState<customerDto[]>([]);
  const [selectedClient, setSelectedClient] = useState<customerDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const NowDate = new Date();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customer/tenant/${tenantId}`);
        console.log("clients data", response.data);
        setCustomers(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des clients", error);
      }
    };
    fetchCustomer();
  }, [tenantId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/product/tenant/${tenantId}`);
        console.log("product", response.data);
        setProductList(response.data);
      } catch (error) {
        console.log("Erreur lors du chargement des produits", error);
      }
    };
    fetchProduct();
  }, [tenantId]);

  const productOptions: ProductOption[] = productList.map((prod) => ({
    value: prod.id,
    label: prod.name,
    stock: prod.stock,
    unitPrice: prod.price,
  }));

  const customerOptions: CustomerOption[] = customers.map((customer) => ({
    value: customer.id,
    label: `${customer.name} - ${customer.phone}`,
    customer: customer,
  }));

  const handleAddItem = () => {
    setSaleItems([...saleItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleChangeItem = (
    index: number,
    key: keyof SaleItem,
    value: string | number
  ) => {
    const updatedItems = [...saleItems];
    if (key === "productId") {
      updatedItems[index][key] = value as string;
    } else {
      updatedItems[index][key] = value as number;
    }
    setSaleItems(updatedItems);
  };

  const totalPrice = saleItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSaleTypeChange = (type: "cash" | "credit") => {
    setIsCredit(type === "credit");
    if (type === "cash") {
      setSelectedClient(null);
      setCustomerId("");
    }
  };

  const handleClientSelect = (clientId: string) => {
    setCustomerId(clientId);
    const client = customers.find((c) => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleProductSelect = (
    index: number,
    selectedProduct: SingleValue<ProductOption>
  ) => {
    if (selectedProduct) {
      handleChangeItem(index, "productId", selectedProduct.value);
      handleChangeItem(index, "unitPrice", selectedProduct.unitPrice);
    }
  };

  const handleCustomerSelect = (
    selectedCustomer: SingleValue<CustomerOption>
  ) => {
    if (selectedCustomer) {
      handleClientSelect(selectedCustomer.value);
    } else {
      setSelectedClient(null);
      setCustomerId("");
    }
  };

  const handleNewClientRedirect = () => {
    router.push("/client");
  };

  const handleSubmit = async () => {
    if (isCredit && !customerId) {
      alert("Veuillez sélectionner un client pour une vente à crédit");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        sellerId: userId,
        customerId: isCredit ? customerId : null,
        isCredit,
        amountPaid,
        totalPrice,
        tenantId: tenantId,
        saleItems,
      };
      const response = await api.post("/directeSale", payload);
      console.log("Vente directe créée avec succès :", response.data);
      toast.success("La vente a été effectuée avec succès");
      // Reset form
      setSaleItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
      setAmountPaid(0);
      setCustomerId("");
      setSelectedClient(null);
      setIsCredit(false);
      const createdSaleId: string = response.data?.data.id;
      console.log("id de la vente:", createdSaleId);
      if (createdSaleId) {
        router.push(`/print/${createdSaleId}`);
      } else {
        console.warn("Aucun ID de vente reçu pour la redirection");
      }
    } catch (error: unknown) {
      console.error("Erreur :", error);
      toast.error("Erreur lors de l'enregistrement de la vente");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  // Styles typés pour react-select - Version générique
  const createCustomSelectStyles = <T,>(): StylesConfig<
    T,
    false,
    GroupBase<T>
  > => ({
    control: (provided: CSSObjectWithLabel) => ({
      ...provided,
      minHeight: "40px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      "&:hover": {
        borderColor: "#9ca3af",
      },
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    }),
    option: (provided: CSSObjectWithLabel, state: SelectState) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
  });

  const customerSelectStyles = createCustomSelectStyles<CustomerOption>();
  const productSelectStyles = createCustomSelectStyles<ProductOption>();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            {/* Section principale - Gauche */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              {/* Bouton retour */}
              <div className="order-first sm:order-none">
                <button
                  onClick={handleBack}
                  className="w-full sm:w-auto bg-gray-700 text-white hover:bg-gray-800 p-2 cursor-pointer rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <span className="sm:hidden">← Retour</span>
                  <span className="hidden sm:inline">Retour</span>
                </button>
              </div>

              {/* Icône et titre */}
              <div className="flex items-start space-x-3 flex-1">
                <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    <span className="block sm:inline">
                      Espace de Vente Directe de:
                    </span>
                    <span className="block sm:inline mt-1 sm:mt-0 sm:ml-2">
                      <span className="inline-block text-base sm:text-lg lg:text-xl text-green-700 bg-green-100 px-2 py-1 rounded-md break-words">
                        {userName}
                      </span>
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Gestion des ventes et clients
                  </p>
                </div>
              </div>
            </div>
            {/* Section droite - Informations de vente */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-green-50 px-3 py-2 sm:px-4 rounded-lg">
                <span className="text-green-700 font-medium text-sm sm:text-base">
                  <span className="hidden sm:inline">Vente #: </span>
                  <span className="sm:hidden">Vente: </span>
                  {formatDate(NowDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - Toujours en pleine largeur maintenant */}
          <div className="col-span-12">
            {/* Sale Type Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Type de vente
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleSaleTypeChange("cash")}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    !isCredit
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <DollarSign className="h-5 w-5" />
                  <span className="font-medium">Vente comptant</span>
                </button>
                <button
                  onClick={() => handleSaleTypeChange("credit")}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    isCredit
                      ? "border-blue-500 bg-blue-50 text-orange-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Vente à crédit</span>
                </button>
              </div>
            </div>

            {/* Client Selection for Credit Sales */}
            {isCredit && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sélection du client
                  </h3>
                  <button
                    onClick={handleNewClientRedirect}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nouveau client</span>
                  </button>
                </div>
                {selectedClient ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">
                            {selectedClient.name}
                          </h4>
                          <p className="text-sm text-green-700">
                            {selectedClient.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedClient(null);
                          setCustomerId("");
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select<CustomerOption>
                      options={customerOptions}
                      onChange={handleCustomerSelect}
                      value={
                        customerOptions.find(
                          (option) => option.value === customerId
                        ) || null
                      }
                      placeholder="Rechercher et sélectionner un client..."
                      styles={customerSelectStyles}
                      isClearable
                      isSearchable
                      noOptionsMessage={() => "Aucun client trouvé"}
                      loadingMessage={() => "Chargement..."}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sales Items et Récapitulatif côte à côte */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
              {/* Sales Items - 3/4 de la largeur sur grands écrans */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Articles de la vente
                    </h3>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter un produit</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {saleItems.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Produit
                            </label>
                            <Select<ProductOption>
                              options={productOptions}
                              onChange={(selected) =>
                                handleProductSelect(index, selected)
                              }
                              value={
                                productOptions.find(
                                  (opt) => opt.value === item.productId
                                ) || null
                              }
                              placeholder="Sélectionner un produit"
                              styles={productSelectStyles}
                              noOptionsMessage={() => "Aucun produit trouvé"}
                            />
                            {item.productId && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                <div className="text-xs text-blue-700 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Stock disponible:</span>
                                    <span className="font-semibold">
                                      {productOptions.find(
                                        (opt) => opt.value === item.productId
                                      )?.stock || 0}{" "}
                                      unités
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Prix de vente conseillé:</span>
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        productOptions.find(
                                          (opt) => opt.value === item.productId
                                        )?.unitPrice || 0
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantité
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleChangeItem(
                                  index,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {item.productId &&
                              item.quantity >
                                (productOptions.find(
                                  (opt) => opt.value === item.productId
                                )?.stock || 0) && (
                                <div className="mt-1 text-xs text-red-600">
                                  ⚠️ Quantité supérieure au stock disponible
                                </div>
                              )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Prix unitaire
                            </label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleChangeItem(
                                  index,
                                  "unitPrice",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Total
                              </label>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </div>
                            </div>
                            {saleItems.length > 1 && (
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Récapitulatif financier - 1/4 de la largeur, sticky */}
              <div className="xl:col-span-1">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-xl rounded-2xl p-6 space-y-6 sticky top-6">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-orange-800 mb-4">
                      Récapitulatif (FCFA)
                    </h3>
                  </div>
                  {/* Total général */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Total général
                      </h4>
                      <span className="text-xl font-bold text-orange-600">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                  {/* Montant payé avec bouton Soldé */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Montant payé
                    </label>
                    {/* Container pour input et bouton */}
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        placeholder="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-500 focus:outline-none focus:border-orange-400 text-gray-800 placeholder:text-orange-300 font-semibold shadow-sm text-center text-lg"
                      />

                      {/* Bouton Soldé */}
                      <button
                        type="button"
                        onClick={() => setAmountPaid(totalPrice)}
                        disabled={totalPrice === 0}
                        className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm ${
                          totalPrice === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : amountPaid === totalPrice
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
                        }`}
                        title="Cliquez pour solder le montant total"
                      >
                        {amountPaid === totalPrice && totalPrice > 0 ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Soldé
                          </span>
                        ) : (
                          "Soldé"
                        )}
                      </button>
                    </div>
                    {/* Indicateur visuel quand c'est soldé */}
                    {amountPaid === totalPrice && totalPrice > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 text-sm">
                          <Check className="w-4 h-4" />
                          <span className="font-medium">
                            Montant entièrement soldé
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Reste à payer */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Reste à payer
                      </h4>
                      <span
                        className={`text-lg font-bold flex items-center gap-1 ${
                          totalPrice - amountPaid > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {totalPrice - amountPaid === 0 && totalPrice > 0 && (
                          <Check className="w-5 h-5" />
                        )}
                        {formatCurrency(Math.max(0, totalPrice - amountPaid))}
                      </span>
                    </div>
                  </div>

                  {/* Statut de paiement */}
                  <div
                    className={`rounded-xl p-4 text-center font-semibold text-sm ${
                      amountPaid >= totalPrice && totalPrice > 0
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : amountPaid > 0
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {amountPaid >= totalPrice && totalPrice > 0
                      ? "✓ Payé intégralement"
                      : amountPaid > 0
                      ? "⚠ Paiement partiel"
                      : "○ En attente de paiement"}
                  </div>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {/* Version mobile : boutons empilés verticalement */}
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => {
                    setSaleItems([
                      { productId: "", quantity: 1, unitPrice: 0 },
                    ]);
                    setAmountPaid(0);
                    setCustomerId("");
                    setSelectedClient(null);
                    setIsCredit(false);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    (isCredit && !customerId) ||
                    saleItems.some((item) => !item.productId)
                  }
                  className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    isLoading ||
                    (isCredit && !customerId) ||
                    saleItems.some((item) => !item.productId)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Enregistrer la vente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
