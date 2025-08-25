"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { deliveryPersonDto } from "../types/type";
import api from "../prisma/api";
import toast from "react-hot-toast";
import Select from "react-select";
import { useAuth } from "../context/AuthContext";

interface DeliveryProduct {
  id: string;
  productId: string;
  quantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
}
interface DeliveryFormData {
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";
  deliveryPersonId: string;
  deliveryProducts: DeliveryProduct[];
}

interface Product {
  id: string;
  name: string;
  stock: number; // stock disponible
  price: number;
}

export default function CreateDeliveryClient() {
  const [deliveryPerson, setDeliveryPerson] = useState<deliveryPersonDto[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [formData, setFormData] = useState<DeliveryFormData>({
    status: "PENDING",
    deliveryPersonId: "",
    deliveryProducts: [],
  });

  const deliveryPersonOptions = deliveryPerson.map((person) => ({
    value: person.id,
    label: person.name,
  }));
  const ProductOptions = products.map((prod) => ({
    value: prod.id,
    label: prod.name,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const deliveryPersonResp = await api.get(`/deliveryPerson/${tenantId}`);
        setDeliveryPerson(deliveryPersonResp.data);

        const productsResp = await api.get(`/product/tenant/${tenantId}`);
        console.log("Produit data:", productsResp.data);
        setProducts(productsResp.data);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const addProduct = () => {
    const newProduct: DeliveryProduct = {
      id: `temp-${Date.now()}`,
      productId: "",
      quantity: 0,
      deliveredQuantity: 0,
      returnedQuantity: 0,
    };

    setFormData((prev) => ({
      ...prev,
      deliveryProducts: [...prev.deliveryProducts, newProduct],
    }));
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliveryProducts: prev.deliveryProducts.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (
    index: number,
    field: keyof DeliveryProduct,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      deliveryProducts: prev.deliveryProducts.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Fonction pour calculer le prix total de la livraison
  const calculateTotalPrice = (): number => {
    return formData.deliveryProducts.reduce((total, product) => {
      const productInfo = getProductById(product.productId);
      if (productInfo && product.quantity > 0) {
        return total + productInfo.price * product.quantity;
      }
      return total;
    }, 0);
  };

  // Fonction pour calculer le total basé sur les quantités livrées
  const calculateDeliveredTotal = (): number => {
    return formData.deliveryProducts.reduce((total, product) => {
      const productInfo = getProductById(product.productId);
      if (productInfo && product.deliveredQuantity > 0) {
        return total + productInfo.price * product.deliveredQuantity;
      }
      return total;
    }, 0);
  };
  // Fonction pour formater le prix en FCFA
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deliveryPersonId) {
      setError("Veuillez sélectionner un livreur");
      return;
    }

    if (formData.deliveryProducts.length === 0) {
      setError("Veuillez ajouter au moins un produit");
      return;
    }

    const invalidProducts = formData.deliveryProducts.some(
      (product) => !product.productId || product.quantity <= 0
    );

    if (invalidProducts) {
      setError("Veuillez remplir tous les champs des produits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const dataToSend = {
        ...formData,
        tenantId: tenantId,
        deliveryProducts: formData.deliveryProducts.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          deliveredQuantity: product.deliveredQuantity,
          returnedQuantity: product.returnedQuantity,
        })),
      };

      const response = await api.post(
        `/delivery/${formData.deliveryPersonId}`,
        dataToSend
      );
      console.log("Livraison créée:", response.data);
      setFormData({
        status: "PENDING",
        deliveryPersonId: "",
        deliveryProducts: [],
      });
      toast.success("Livraison créee avec succès...!");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setError("Erreur lors de la création de la livraison");
    } finally {
      setLoading(false);
    }
  };
  if (loading && deliveryPerson.length === 0) {
    return (
      <div className="flex">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Création de la livraison</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Livreur */}
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livreur <span className="text-red-600">*</span>
              </label>
              <Select
                options={deliveryPersonOptions}
                value={deliveryPersonOptions.find(
                  (option) => option.value === formData.deliveryPersonId
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryPersonId: selectedOption?.value || "",
                  }))
                }
                placeholder="Choisir un livreur"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Produits */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Produits à livrer <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={addProduct}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-orange-500"
                >
                  Ajouter un produit
                </button>
              </div>
              {formData.deliveryProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun produit ajouté. Cliquez sur
                  <span className="text-green-800 font-bold italic">
                    Ajouter un produit
                  </span>{" "}
                  <span className=""> pour commencer.</span>
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.deliveryProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 p-4 rounded-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">
                          Produit {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sélecteur produit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Produit<span className="text-red-600">*</span>
                          </label>
                          <Select
                            options={ProductOptions}
                            value={products
                              .map((prod) => ({
                                value: prod.id,
                                label: prod.name,
                              }))
                              .find(
                                (option) => option.value === product.productId
                              )}
                            onChange={(selectedOption) =>
                              updateProduct(
                                index,
                                "productId",
                                selectedOption?.value || ""
                              )
                            }
                            placeholder="Sélectionner un produit"
                            className="react-select-container"
                            classNamePrefix="react-select"
                            required
                          />

                          {product.productId && (
                            <p className="text-sm text-gray-500 mt-1 flex flex-col">
                              <span>
                                Stock disponible :
                                {getProductById(product.productId)?.stock ??
                                  "N/A"}
                              </span>{" "}
                              <span className="font-bold">
                                prix de vente:
                                {getProductById(product.productId)?.price} Fcfa
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Champs quantité */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantité *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantité livrée
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={product.deliveredQuantity}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "deliveredQuantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantité retournée
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={product.returnedQuantity}
                            onChange={(e) =>
                              updateProduct(
                                index,
                                "returnedQuantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Section Prix Total */}
            {formData.deliveryProducts.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Prix total prévu
                    </h3>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPrice(calculateTotalPrice())}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Prix total livré
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(calculateDeliveredTotal())}
                    </div>
                  </div>

                  {/* Détail par produit */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Détail des produits :
                    </h4>
                    {formData.deliveryProducts.map((product) => {
                      const productInfo = getProductById(product.productId);
                      const subtotalPrevu = productInfo
                        ? productInfo.price * product.quantity
                        : 0;
                      const subtotalLivre = productInfo
                        ? productInfo.price * product.deliveredQuantity
                        : 0;

                      return (
                        <div
                          key={product.id}
                          className="flex justify-between text-sm text-gray-600 border-b pb-2"
                        >
                          <div className="flex-1">
                            <span className="font-medium">
                              {productInfo?.name || "Produit non sélectionné"}
                            </span>
                            <div className="text-xs text-gray-500">
                              Prévu: {product.quantity} | Livré:{" "}
                              {product.deliveredQuantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-orange-600">
                              {formatPrice(subtotalPrevu)}
                            </div>
                            <div className="text-green-600 text-xs">
                              {formatPrice(subtotalLivre)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    status: "PENDING",
                    deliveryPersonId: "",
                    deliveryProducts: [],
                  });
                  setError("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création en cours..." : "Créer la livraison"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
