import { ordersService } from "@/app/service/orders.service";
import { customerService } from "@/app/service/customers.service";
import type { Customer } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { OrdersView } from "./orders-view";

export async function OrdersContent() {
  const [ordersRes, customersRes] = await Promise.all([
    ordersService.getOrders(),
    customerService.getCustomers(),
  ]);

  if (ordersRes.error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load orders. Please try again.
      </div>
    );
  }

  const orders: OrderWithCustomer[] = ordersRes.data?.data ?? [];
  const customers: Customer[] = customersRes.data?.data ?? [];

  return <OrdersView orders={orders} customers={customers} />;
}