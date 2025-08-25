"use client";
import React, { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import DeliveryList from "../components/deliveries/DeliveryList";
import Formdelivery from "../components/deliveries/Formdelivery";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="flex">
      <div className="">
        <Navbar />
      </div>
      <div className="flex-1/2">
        <Formdelivery
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
        />
        <DeliveryList />
      </div>
    </div>
  );
}
