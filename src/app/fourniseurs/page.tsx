"use client";
import React, { useState } from "react";
import { Card } from "../components/forms/Card";
import Fournisseur from "../components/fournisseurs/Fournisseur";
import Navbar from "../components/navbar/Navbar";
import { FormFourn } from "../components/fournisseurs/FormFourn";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    // Tu peux déclencher un refetch ici via un état global, un context ou props vers <Fournisseur />
    handleCloseModal();
  };

  return (
    <div className="flex dark:bg-gray-400 min-h-screen">
      <Navbar />
      <div className="flex-1 p-4">
        <Card
          title="Liste des fournisseurs"
          text="Recherchez un fournisseur..."
          desc="Ajouter un fournisseur"
          className="bg-orange-600 cursor-pointer text-white"
          onClick={handleOpenModal}
        />

        <FormFourn
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode="create"
          onSuccess={handleSuccess}
        />

        <div className="mt-6">
          <Fournisseur />
        </div>
      </div>
    </div>
  );
}
