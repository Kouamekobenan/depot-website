// Types pour les commandes
export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  // Ajoutez d'autres champs selon votre API
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
  customerId?: string;
  orderItems?: OrderItemDto[];
  tenantId?: string;
}

export type OrderStatus =
  | "PENDING"
  | "COMPLETED"
  | "SHIPPED"
  | "PAID"
  | "DELIVERED"
  | "CANCELED";

export interface OrderPaginationResponse {
  data: OrderDto[];
  totalPage: number;
  total: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrderFilters {
  search?: string;
  status?: string | "ALL";
  page?: number;
  limit?: number;
}

export interface OrderStatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  bgColor: string;
}

export interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  canceled: number;
  shipped: number;
  delivered: number;
}

// Types pour les props des composants
export interface OrderTableProps {
  orders: OrderDto[];
  loading: boolean;
  onViewDetails: (orderId: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

export interface OrderFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export interface OrderStatsProps {
  stats: OrderStats;
  loading: boolean;
}
