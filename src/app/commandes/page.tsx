"use client";
import React from "react";
import Navbar from "../components/navbar/Navbar";
import CreateOrderComponent from "../components/commandes/Commande";
export default function Commandes() {
  return (
    <div className="flex ">
      <div className="">
        <Navbar />
      </div>
      <div className="">
        <CreateOrderComponent />
      </div>
    </div>
  );
}
