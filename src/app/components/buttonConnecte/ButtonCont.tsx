import React from "react";

interface ButtonProps {
  label: React.ReactNode; // string | JSX.Element
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
const Button: React.FC<ButtonProps> = ({
  label,
  type = "button",
  disabled = false,
  className = "",
  onClick = () => {},
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
