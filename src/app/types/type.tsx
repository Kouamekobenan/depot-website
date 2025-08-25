export interface productItems {
  id: string;
  name: string;
  description?: string;
  price: number;
  criticalStockThreshold: number;
  purchasePrice: number;
  stock: number;
  supplierId: string;
  categoryId: string;
}
export interface productDto {
  name: string;
  description?: string;
  price: number;
  criticalStockThreshold: number;
  purchasePrice: number;
  stock: number;
  supplierId: string;
  categoryId: string;
}
export interface fournisseurDto {
  id: string;
  name: string;
  email: string;
  phone: string;
}
export interface deliveryProductDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  tenantId: string;
  tenantName: string;
  role: "ADMIN" | "MANAGER" | "DELIVERY_PERSON";
}
export interface Category {
  id: string;
  name: string;
}
export interface FiltreProductDto {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  supplierId?: string;
  inStock?: boolean;
}

export interface deliveryPersonDto {
  id: string;
  name: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  status: "PENDING" | "COMPLETED" | "SHIPPED" | "DELIVERED" | "CANCELED";
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
  userName: string;
  userMail: string;
  userPhone: string;
}

export interface deliveryProducts {
  id: string;
  productId: string;
  quantity: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  product: {
    name: string;
    price: number;
  };
  totalPrice: number;
}
export interface deliveryDto {
  id: string;
  deliveryPersonId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
  createdAt: Date;
  deliveryPerson: {
    id: string;
    name: string;
  };
  deliveryProducts: deliveryProducts[];
  totalPrice: number;
}

// Sales direct
export interface directSaleItem {
  id: string;
  directSaleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  totalPrice: number;
}
export interface customerName {
  name: string;
}

export interface directSaleDto {
  id: string;
  selledId: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isCredit: boolean;
  amountPaid: number;
  dueAmount: number;
  saleItems: directSaleItem[];
  createdAt: Date;
  updatedAt: Date;
  customer: customerName;
}
export interface customerDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}
export interface dashbordItems {
  totalSales: number;
  totalDeliveries: number;
  totalRevenue: number;
  salesToday: number;
  deliveriesToday: number;
}
export interface tenantDto {
  id: string;
  name: string;
}
