// "use client";
export const dynamic = "force-dynamic";
import Navbar from "../components/navbar/Navbar";
import DeliveryPersonClient from "./DeliveryPersonClient";

export default function Page() {
  return (
    <div className="flex">
      <div className="card">
        <Navbar />
      </div>
      <div className="content flex-1/2">
        <DeliveryPersonClient />
      </div>
    </div>
  );
}
