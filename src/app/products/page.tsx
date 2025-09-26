// "use client";
import React from "react";
import Dashbord from "../components/products/Dashbord";
import DataProduct from "../components/products/DataProduct";

export default function page() {
  return (
    <div className="flex">
      <div className="">
        <Dashbord />
        <DataProduct />
      </div>
    </div>
  );
}
