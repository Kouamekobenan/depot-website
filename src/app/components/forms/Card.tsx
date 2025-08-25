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
    <div className="w-full border p-4 rounded-xl border-gray-300 bg-white shadow-sm">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 flex-1">{title}</h2>

        {/* Champ de recherche */}
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={text}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-600"
            onClick={onSearchClick}
          />
        </div>

        {/* Bouton d'ajout */}
        <button
          onClick={onClick}
          className={`flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-white bg-amber-600 hover:bg-orange-700 transition ${className}`}
        >
          <span className="text-lg font-bold">+</span>
          <span>{desc}</span>
        </button>
      </div>
    </div>
  );
};
