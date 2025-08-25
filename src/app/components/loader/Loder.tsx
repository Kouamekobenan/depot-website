// components/ui/Loader.tsx
import React from "react";
interface LoaderProps {
  message?: string;
  size?: number;
  color?: string;
}
const Loader: React.FC<LoaderProps> = ({
  message = "Chargement en cours...",
  size = 32,
  color = "#3B82F6", // blue-500
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div
        className="rounded-full border-4 animate-spin"
        style={{
          width: size,
          height: size,
          borderTopColor: "transparent",
          borderRightColor: color,
          borderBottomColor: color,
          borderLeftColor: color,
        }}
      />
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-200 font-medium text-center">
        {message}
      </p>
    </div>
  );
};

export default Loader;
