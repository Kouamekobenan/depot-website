import { Search } from "lucide-react";
import React from "react";

interface Items {
  title: string;
  text: string;
  desc?: string;
  className?: string;
  onClick?: () => void; // Bouton "Ajouter"
  onSearchClick?: () => void; // Clic sur icône de recherche
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Card: React.FC<Items> = ({
  title,
  text,
  desc,
  className = "",
  onClick,
  onSearchClick,
  value,
  onChange,
}) => {
  return (
    <div className="w-full border p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border-gray-300 bg-white shadow-sm mx-2 sm:mx-0">
      {/* Layout responsive : empilé sur mobile, en ligne sur desktop */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 sm:gap-4 lg:gap-6">
        {/* Titre responsive */}
        <div className="flex-shrink-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
            {title}
          </h2>
        </div>

        {/* Container pour recherche et bouton sur mobile/tablet */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-1 lg:justify-end">
          {/* Champ de recherche responsive */}
          <div className="relative flex-1 lg:flex-none lg:w-80 max-w-md">
            <input
              type="text"
              value={value}
              onChange={onChange}
              placeholder={text}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Search
              size={16}
              className="sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={onSearchClick}
            />
          </div>

          {/* Bouton d'ajout responsive */}
          <button
            onClick={onClick}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-md text-white bg-amber-600 hover:bg-orange-700 transition-all duration-200 text-sm sm:text-base font-medium whitespace-nowrap min-w-0 ${className}`}
          >
            <span className="text-base sm:text-lg font-bold flex-shrink-0">
              +
            </span>
            <span className="hidden sm:inline truncate">{desc}</span>
            <span className="sm:hidden truncate">
              {desc?.split(" ")[0] || "Ajouter"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
