"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../forms/Button";
import { DoorClosed } from "lucide-react";
import api from "@/app/prisma/api";
import toast from "react-hot-toast";
import { deliveryPersonDto } from "@/app/types/type";
import { useAuth } from "@/app/context/AuthContext";

interface FormFournProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  existingPerson?: deliveryPersonDto | null;
  onSuccess: () => void; // Callback pour recharger la liste après ajout/modif
}
export const FormLivModal: React.FC<FormFournProps> = ({
  isOpen,
  onClose,
  mode,
  existingPerson,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useAuth();
  const tennantId = user?.tenantId;
  useEffect(() => {
    if (mode === "edit" && existingPerson) {
      setName(existingPerson.name || "");
      setPhone(existingPerson.phone || "");
    } else {
      setName("");
      setPhone("");
    }
  }, [mode, existingPerson]);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await api.post("/deliveryPerson", {
          name,
          phone,
          tenantId: tennantId,
        });
        toast.success("DeliveryPerson add successfully 🎉");
      } else if (mode === "edit") {
        await api.put(`/deliveryPerson/${existingPerson?.id}`, {
          name,
          phone,
        });
        toast.success("Livreur modifié avec succès !");
      }
      onSuccess(); // recharge les données dans la page parente
      onClose(); // ferme le modal
    } catch (error: unknown) {
      console.error("Failled to add deliveryPerson", error);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <DoorClosed />
        </button>
        <h2 className="text-xl font-semibold text-center mb-4">
          {mode === "create" ? "Ajouté un livreur" : "Modifier le livreur"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du livreur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="text"
            placeholder="Numéro de téléphone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              className={`w-[150px] text-white ${
                mode === "create"
                  ? "bg-orange-700 hover:bg-orange-600"
                  : "bg-blue-700 hover:bg-blue-600"
              }`}
              label={mode === "create" ? "Ajouter" : "Modifier"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
