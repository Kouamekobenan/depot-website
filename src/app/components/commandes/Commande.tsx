"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Loader2,
  AlertTriangle,
  ListCollapse,
} from "lucide-react";
import { productItems } from "@/app/types/type";
import api from "@/app/prisma/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "../forms/Button";
import { useAuth } from "@/app/context/AuthContext";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Prix d'achat (purchasePrice)
  sellingPrice: number; // Prix de vente (price)
  totalPrice: number; // Total prix d'achat
  totalSellingPrice: number; // Total prix de vente
  unitProfit: number; // Bénéfice par unité
  totalProfit: number; // Bénéfice total pour cet article
  maxStock: number;
}

interface PaginationDto {
  page: number;
  limit: number;
  name: string;
}

const CreateOrderComponent = () => {
  // États du composant
  const [, setAllProducts] = useState<productItems[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<productItems[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const limit = 5;
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  // Fonction pour charger les produits avec pagination côté serveur
  const fetchProducts = useCallback(
    async (page: number, name: string) => {
      try {
        setProductsLoading(true);
        setError(null);
        const params: PaginationDto = {
          page: page,
          limit: limit,
          name: searchTerm,
        };

        let endpoint = `/product/paginate/${tenantId}`;

        // Si il y a un terme de recherche, utiliser l'endpoint de filtrage
        if (name.trim()) {
          endpoint = `/product/filter/${tenantId}`;
          params.name = name.trim();
        }
        const resp = await api.get(endpoint, { params });
        const result = resp.data;

        console.log("Réponse API produits:", result);
        let products: productItems[] = [];
        let total = 0;
        let totalPagesFromAPI = 1;

        if (Array.isArray(result)) {
          // Si la réponse est directement un tableau
          products = result;
          total = result.length;
          totalPagesFromAPI = 1;
        } else if (result.data && Array.isArray(result.data)) {
          // Structure avec data
          products = result.data;
          total =
            result.totalItems ||
            result.total ||
            result.count ||
            products.length;
          totalPagesFromAPI =
            result.totalPages || result.totalPage || Math.ceil(total / limit);
        } else if (result.products && Array.isArray(result.products)) {
          // Structure avec products
          products = result.products;
          total =
            result.totalItems ||
            result.total ||
            result.count ||
            products.length;
          totalPagesFromAPI =
            result.totalPages || result.totalPage || Math.ceil(total / limit);
        } else {
          throw new Error("Format de réponse invalide");
        }
        setFilteredProducts(products);
        setAllProducts(products);
        setTotalItems(total);
        setTotalPages(totalPagesFromAPI);
      } catch (error: unknown) {
        console.error("Erreur API produits", error);
        setError("Impossible de charger les produits");
        setFilteredProducts([]);
        setAllProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setProductsLoading(false);
      }
    },
    [limit, tenantId, searchTerm]
  );

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Effet pour charger les produits quand la page ou le terme de recherche débounced change
  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchProducts]);

  // Effet pour réinitialiser la page lors d'une nouvelle recherche
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm, currentPage]);

  // Ajouter un produit à la commande de réapprovisionnement
  const addProductToOrder = (product: productItems) => {
    const existingItem = orderItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      const newTotalPrice = newQuantity * existingItem.unitPrice;
      const newTotalSellingPrice = newQuantity * existingItem.sellingPrice;
      const newTotalProfit = newTotalSellingPrice - newTotalPrice;

      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newTotalPrice,
                totalSellingPrice: newTotalSellingPrice,
                totalProfit: newTotalProfit,
              }
            : item
        )
      );
    } else {
      const unitProfit = product.price - product.purchasePrice;
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.purchasePrice,
        sellingPrice: product.price,
        totalPrice: product.purchasePrice,
        totalSellingPrice: product.price,
        unitProfit: unitProfit,
        totalProfit: unitProfit,
        maxStock: product.stock,
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  // Modifier la quantité d'un article
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
              totalSellingPrice: newQuantity * item.sellingPrice,
              totalProfit: newQuantity * item.unitProfit,
            }
          : item
      )
    );
  };

  // Supprimer un article
  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  // Calculer le total de la commande (coût d'achat)
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Nouvelles fonctions de calcul pour la rentabilité
  const calculateTotalCost = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotalRevenue = () => {
    return orderItems.reduce(
      (total, item) => total + item.totalSellingPrice,
      0
    );
  };

  const calculateTotalProfit = () => {
    return orderItems.reduce((total, item) => total + item.totalProfit, 0);
  };

  const calculateProfitMargin = () => {
    const totalRevenue = calculateTotalRevenue();
    if (totalRevenue === 0) return 0;
    return (calculateTotalProfit() / totalRevenue) * 100;
  };

  // Vérifier la quantité commandée pour réapprovisionnement
  const getProductQuantityInCart = (productId: string) => {
    const item = orderItems.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Navigation pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Soumettre la commande
  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert("Veuillez ajouter au moins un produit à commander");
      return;
    }
    setLoading(true);
    const orderData = {
      userId: user?.id,
      status: orderStatus,
      totalPrice: calculateTotal(),
      tenantId: tenantId,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };

    try {
      const response = await api.post("/order", orderData);
      console.log("Commande de réapprovisionnement créée:", response.data);
      toast.success("Commande de réapprovisionnement créée avec succès...!");

      // Réinitialiser le formulaire
      setOrderStatus("PENDING");
      setOrderItems([]);

      // Recharger les produits pour mettre à jour les stocks
      fetchProducts(currentPage, debouncedSearchTerm);
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast.error(
        "Erreur lors de la création de la commande de réapprovisionnement"
      );
    } finally {
      setLoading(false);
    }
  };

  // Composant d'affichage d'erreur
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );

  // Composant de chargement
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
    </div>
  );

  // Obtenir les produits en rupture de stock
  const getOutOfStockProducts = () => {
    return filteredProducts.filter((product) => product.stock === 0);
  };

  // Composant pour afficher un produit avec ses métriques de rentabilité
  const ProductCard = ({ product }: { product: productItems }) => {
    const quantityInCart = getProductQuantityInCart(product.id);
    const isOutOfStock = product.stock === 0;
    const unitProfit = product.price - product.purchasePrice;
    const profitMargin =
      product.price > 0 ? (unitProfit / product.price) * 100 : 0;

    return (
      <div
        className={`p-4 rounded-lg border hover:shadow-md transition-all duration-300 ${
          isOutOfStock
            ? "out-of-stock-card pulse-red-animation"
            : "bg-white border-gray-200"
        }`}
      >
        <h3 className="font-semibold text-gray-900 mb-3">{product.name}</h3>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Prix d&apos;achat:</span>
            <span className="font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              {product.purchasePrice.toFixed(0)} F
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Prix de vente:</span>
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.price.toFixed(0)} F
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t pt-2">
            <span className="text-gray-600">Bénéfice/unité:</span>
            <span
              className={`font-bold px-2 py-1 rounded ${
                unitProfit >= 0
                  ? "text-green-600 bg-green-50"
                  : "text-red-600 bg-red-50"
              }`}
            >
              {unitProfit.toFixed(0)} F ({profitMargin.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3 space-y-1">
          <p className={isOutOfStock ? "text-red-600 font-bold" : ""}>
            Stock actuel: {product.stock} unités
          </p>
          {quantityInCart > 0 && (
            <>
              <p className="text-green-600 font-medium">
                À commander: {quantityInCart} unités
              </p>
              <p className="text-purple-600 font-medium bg-purple-50 p-2 rounded">
                💰 Bénéfice potentiel:{" "}
                {(unitProfit * quantityInCart).toFixed(0)} F
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => addProductToOrder(product)}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-medium ${
            isOutOfStock
              ? "bg-red-600 text-white hover:bg-red-700 border-2 border-red-400 blink-animation"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          <Plus className="w-4 h-4" />
          {isOutOfStock ? "Réapprovisionner" : "Commander"}
        </button>
      </div>
    );
  };
  // Composant pour afficher un article de commande avec ses métriques
  const OrderItemCard = ({ item }: { item: OrderItem }) => (
    <div className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            {item.productName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-600">Prix d&apos;achat:</span>
                <span className="font-medium text-red-600">
                  {item.unitPrice.toFixed(2)} Fcfa
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Prix de vente:</span>
                <span className="font-medium text-blue-600">
                  {item.sellingPrice.toFixed(2)} Fcfa
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-600">Stock actuel:</span>
                <span className="font-medium">{item.maxStock} unités</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Bénéfice/unité:</span>
                <span
                  className={`font-medium ${
                    item.unitProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.unitProfit.toFixed(2)} Fcfa
                </span>
              </p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>💰 Bénéfice total prévu:</strong>{" "}
              {item.totalProfit.toFixed(2)} Fcfa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-12 text-center font-semibold text-lg">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right min-w-[120px]">
            <p className="text-xs text-gray-500">Coût total</p>
            <p className="font-bold text-lg text-red-600">
              {item.totalPrice.toFixed(2)} Fcfa
            </p>
            <p className="text-xs text-gray-500">Revenus prévus</p>
            <p className="text-sm font-medium text-blue-600">
              {item.totalSellingPrice.toFixed(2)} Fcfa
            </p>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Styles CSS pour l'animation de clignotement */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0.3;
          }
        }

        @keyframes pulse-red {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            border-color: rgb(239, 68, 68);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.1);
            border-color: rgb(220, 38, 38);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            border-color: rgb(239, 68, 68);
          }
        }

        .blink-animation {
          animation: blink 1.5s infinite;
        }

        .pulse-red-animation {
          animation: pulse-red 2s infinite;
        }

        .out-of-stock-card {
          border: 2px solid rgb(239, 68, 68);
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .stock-warning-banner {
          background: linear-gradient(135deg, #fecaca 0%, #f87171 100%);
        }
      `}</style>

      <div className="mb-8 flex justify-between">
        <div className="">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-orange-600" />
            Commande de Réapprovisionnement
          </h1>
          <p className="text-gray-600">
            Ajoutez des produits à commander pour réapprovisionner le stock et
            analysez la rentabilité
          </p>
        </div>
        <div className="">
          <Link href="/order">
            <Button
              label="Mes commandes"
              className="bg-green-600 hover:bg-green-700 border-0 text-white"
            />
          </Link>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      {/* Bannière d'alerte pour stock épuisé */}
      {!productsLoading && getOutOfStockProducts().length > 0 && (
        <div className="stock-warning-banner p-4 rounded-lg mb-6 border-2 border-red-400 pulse-red-animation">
          <div className="flex items-center gap-3 text-red-800">
            <AlertTriangle className="w-6 h-6 blink-animation" />
            <div>
              <h3 className="font-bold text-lg">
                ⚠️ Attention : Stock épuisé!
              </h3>
              <p className="text-sm">
                {getOutOfStockProducts().length} produit
                {getOutOfStockProducts().length > 1 ? "s sont" : " est"} en
                rupture de stock. Ajoutez-les à votre commande de
                réapprovisionnement pour reconstituer le stock.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {getOutOfStockProducts().map((product) => (
                  <span
                    key={product.id}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    {product.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-8">
        {/* Recherche et liste des produits disponibles */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-600" />
              Produits à Réapprovisionner
            </h2>
            {!productsLoading && (
              <div className="text-sm text-gray-500">
                {totalItems > 0 ? (
                  <>
                    {totalItems} produit{totalItems > 1 ? "s" : ""} trouvé
                    {totalItems > 1 ? "s" : ""}
                    {debouncedSearchTerm && ` pour "${debouncedSearchTerm}"`}
                  </>
                ) : debouncedSearchTerm ? (
                  `Aucun résultat pour "${debouncedSearchTerm}"`
                ) : (
                  "Aucun produit"
                )}
              </div>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {productsLoading ? (
            <LoadingSpinner />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearchTerm
                ? `Aucun produit trouvé pour "${debouncedSearchTerm}"`
                : "Aucun produit disponible"}
            </div>
          ) : (
            <>
              {/* Grille des produits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    {/* Numéros de page */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((pageNum) => {
                          const delta = 2;
                          return (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - delta &&
                              pageNum <= currentPage + delta)
                          );
                        })
                        .map((pageNum, index, array) => {
                          const showLeftEllipsis =
                            index === 1 && array[0] !== 1 && array[1] !== 2;
                          const showRightEllipsis =
                            index === array.length - 2 &&
                            array[array.length - 1] !== totalPages &&
                            array[array.length - 2] !== totalPages - 1;
                          return (
                            <React.Fragment key={pageNum}>
                              {showLeftEllipsis && (
                                <span className="px-2">...</span>
                              )}
                              <button
                                onClick={() => goToPage(pageNum)}
                                className={`px-3 py-2 border rounded-lg min-w-[40px] ${
                                  pageNum === currentPage
                                    ? "bg-orange-600 text-white border-orange-600"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                              {showRightEllipsis && (
                                <span className="px-2">...</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </div>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Info pagination */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Page {currentPage} sur {totalPages} • {totalItems} produit
                {totalItems > 1 ? "s" : ""} au total
              </div>
            </>
          )}
        </div>

        {/* Articles de la commande avec analyse de rentabilité */}
        {orderItems.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              Commande de Réapprovisionnement ({orderItems.length} article
              {orderItems.length > 1 ? "s" : ""})
            </h2>

            {/* Liste des articles */}
            <div className="space-y-4">
              {orderItems.map((item) => (
                <OrderItemCard key={item.productId} item={item} />
              ))}
            </div>

            {/* Résumé final détaillé */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              {/* Message de conseil */}
              {calculateProfitMargin() < 20 && calculateTotalProfit() > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-5 h-5" />
                    <p className="text-sm">
                      <strong>⚠️ Marge faible:</strong> Votre marge bénéficiaire
                      est de {calculateProfitMargin().toFixed(1)}%. Vous
                      pourriez envisager de revoir vos prix de vente pour
                      améliorer la rentabilité.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setOrderItems([]);
            }}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Vider le Panier
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || orderItems.length === 0}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Créer la Commande ({calculateTotalCost().toFixed(0)} Fcfa)
              </>
            )}
          </button>
        </div>

        {/* Statistiques globales en bas de page */}
        {orderItems.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border">
            <h3 className="text-lg flex gap-2 font-semibold text-gray-800 mb-4">
              <ListCollapse /> Détails de Performance par Produit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3">Produit</th>
                    <th className="text-center py-2 px-3">Qté</th>
                    <th className="text-right py-2 px-3">Prix Achat</th>
                    <th className="text-right py-2 px-3">Prix Vente</th>
                    <th className="text-right py-2 px-3">Marge %</th>
                    <th className="text-right py-2 px-3">Bénéfice Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-200"
                    >
                      <td className="py-2 px-3 font-medium">
                        {item.productName}
                      </td>
                      <td className="text-center py-2 px-3">{item.quantity}</td>
                      <td className="text-right py-2 px-3 text-red-600">
                        {item.unitPrice.toFixed(0)} F
                      </td>
                      <td className="text-right py-2 px-3 text-blue-600">
                        {item.sellingPrice.toFixed(0)} F
                      </td>
                      <td className="text-right py-2 px-3 text-purple-600 font-medium">
                        {item.sellingPrice > 0
                          ? (
                              (item.unitProfit / item.sellingPrice) *
                              100
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </td>
                      <td className="text-right py-2 px-3 text-green-600 font-bold">
                        {item.totalProfit.toFixed(0)} F
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400 font-bold">
                    <td className="py-3 px-3">TOTAL</td>
                    <td className="text-center py-3 px-3">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td className="text-right py-3 px-3 text-red-600">
                      {calculateTotalCost().toFixed(0)} F
                    </td>
                    <td className="text-right py-3 px-3 text-blue-600">
                      {calculateTotalRevenue().toFixed(0)} F
                    </td>
                    <td className="text-right py-3 px-3 text-purple-600">
                      {calculateProfitMargin().toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-3 text-green-600 text-lg">
                      {calculateTotalProfit().toFixed(0)} F
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateOrderComponent;
