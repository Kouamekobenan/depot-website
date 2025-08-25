import React from "react";
interface Items {
  nom: string;
  somme?: number;
  className?: string;
}
export const Profil: React.FC<Items> = ({ nom, somme = 0, className = "" }) => {
  return (
    <div className="w-full flex justify-between gap-2 items-center border p-4 rounded-b-sm border-gray-300 bg-white shadow-sm">
      <div className="flex-1 font-semibold text-xl text-blue-950">{nom}</div>
      <div className="flex gap-5 ">
        <span className={`${className} text-2xl flex flex-col justify-between`}>
          profit du mois
        </span>
        <span
          className={`${className} text-2xl flex flex-col justify-between bg-orange-100 px-3 rounded-sm font-bold`}
        >
          {somme} Fcfa
        </span>
      </div>
    </div>
  );
};
