import { customerService } from "@/app/service/customers.service";
import { ordersService } from "@/app/service/orders.service";
import { buildCustomerRows } from "@/lib/customers";
import type { Customer, Order } from "@/types/customer";
import { CustomersView } from "./customers-view";


export async function CustomersContent() {
  const [customersRes, ordersRes] = await Promise.all([
    customerService.getCustomers(),
    ordersService.getOrders(),
  ]);

  if (customersRes.error || ordersRes.error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load customers. Please try again.
      </div>
    );
  }

  const customers: Customer[] = customersRes.data?.data ?? [];
  const orders: Order[] = ordersRes.data?.data ?? [];

  return <CustomersView rows={buildCustomerRows(customers, orders)} />;
}