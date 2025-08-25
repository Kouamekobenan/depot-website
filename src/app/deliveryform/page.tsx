// "use client";
import CreateDeliveryClient from "./PageClient";

export default function PageServer() {
  return (
    <div>
      {/* Le composant client est appelé ici */}
      <CreateDeliveryClient />
    </div>
  );
}
