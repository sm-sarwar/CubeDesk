import type { OrderWithCustomer } from "@/types/order";

export const orderDue = (o: OrderWithCustomer) =>
  Math.max((Number(o.totalAmount) || 0) - (Number(o.paidAmount) || 0), 0);

export function summarizeOrders(orders: OrderWithCustomer[]) {
  const active = orders.filter((o) => o.status !== "cancelled");
  const sales = active.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
  const collected = active.reduce((s, o) => s + (Number(o.paidAmount) || 0), 0);

  return {
    count: active.length,
    pending: active.filter((o) => o.status === "pending").length,
    sales,
    collected,
    due: Math.max(sales - collected, 0),
  };
}