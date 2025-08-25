import React from "react";

interface ButtonsProps {
  label: string | null | React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean; 
}

export const Button: React.FC<ButtonsProps> = ({
  label,
  onClick,
  type = "button",
  className = "",
  disabled = false, //Valeur par défaut
}) => {
  return (
    <div>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled} // ✅ Application de la prop disabled
        className={`text-2xl border-blue-800 border rounded-xl p-1 hover:bg-blue-300 w-[200px] hover:text-white hover:transition ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-300" // ✅ Styles pour l'état disabled
            : "hover:bg-blue-300 cursor-pointer" // ✅ Styles pour l'état normal
        } ${className}`}
      >
        <span
          className={`font-light ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {label}
        </span>
      </button>
    </div>
  );
};
