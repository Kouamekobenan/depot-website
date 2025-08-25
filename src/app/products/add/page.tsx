// app/products/add/page.tsx
// "use client";
import { Suspense } from "react";
import ProductFormContent from "./ProductFormContent";

// Composant de chargement
function LoadingProductForm() {
  return (
    <div className="max-w-4xl mx-auto mt-8 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">
              Chargement du formulaire...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingProductForm />}>
      <ProductFormContent />
    </Suspense>
  );
}
