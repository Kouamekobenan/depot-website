"use client";
import { DoorClosed } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../forms/Button";
import { fournisseurDto } from "@/app/types/type";
import api from "@/app/prisma/api";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

interface FormFournProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  existingFournisseur?: fournisseurDto | null;
  onSuccess: () => void; // Callback pour recharger la liste après ajout/modif
}
export const FormFourn: React.FC<FormFournProps> = ({
  isOpen,
  onClose,
  mode,
  existingFournisseur = null,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  // Préremplir si on modifie
  useEffect(() => {
    if (mode === "edit" && existingFournisseur) {
      setName(existingFournisseur.name || "");
      setEmail(existingFournisseur.email || "");
      setPhone(existingFournisseur.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [mode, existingFournisseur]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await api.post("/supplier", { name, email, phone, tenantId });
        toast.success("fournisseur ajouté avec succès !");
      } else if (mode === "edit" && existingFournisseur) {
        await api.put(`/supplier/${existingFournisseur.id}`, {
          name,
          email,
          phone,
        });
        toast.success("fournisseur modifié avec succès !");
      }
      onSuccess(); // recharge les données dans la page parente
      onClose(); // ferme le modal
    } catch (err) {
      console.error("Erreur lors de la soumission :", err);
    }
  };
  if (!isOpen) return null;
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
          {mode === "create"
            ? "Ajouter un fournisseur"
            : "Modifier le fournisseur"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom du fournisseur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            type="text"
            placeholder="numéro de télephone (optionel)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="flex gap-4 pt-2">
            <Button
              type="submit"
              className={`w-[150px] text-white ${
                mode === "create"
                  ? "bg-orange-700 hover:bg-orange-600"
                  : "bg-green-700 hover:bg-green-600"
              }`}
              label={mode === "create" ? "Ajouter" : "Modifier"}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
