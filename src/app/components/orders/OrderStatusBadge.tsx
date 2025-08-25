import { getStatusConfig } from "@/app/utils/orderUtil";
import React from "react";

interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shadow-sm ${config.color} ${sizeClasses[size]}`}
    >
      <IconComponent className={`mr-1.5 ${iconSizes[size]}`} />
      {config.label}
    </span>
  );
};
