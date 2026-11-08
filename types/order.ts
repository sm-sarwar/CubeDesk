import type { Customer, OrderStatus } from "@/types/customer";

export interface OrderWithCustomer {
  id: number;
  customerId: number;
  orderDate: string;
  totalAmount: string;
  paidAmount: string;
  status: OrderStatus;
  notes?: string | null;
  createdAt: string;
  customer: Customer;
}