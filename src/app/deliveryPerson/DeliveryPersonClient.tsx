"use client";

import React, { useState } from "react";
import { LiveryPerson } from "../components/liveryPerson/LiveryPerson";
import { FormLivModal } from "../components/liveryPerson/FormLiv";

export default function DeliveryPersonClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSuccess = () => {
    // Exemple: tu pourrais déclencher un refetch ici
    handleCloseModal();
  };

  return (
    <>
      <FormLivModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode="create"
        onSuccess={handleSuccess}
      />
      <LiveryPerson onClick={handleOpenModal} />
    </>
  );
}
