export type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  source?: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  customerId: number;
  totalAmount: string;
  paidAmount: string;
  status: OrderStatus;
  orderDate: string;
}

export interface CustomerRow extends Customer {
  ordersCount: number;
  totalSpent: number;
  due: number;
  orders: Order[];
}