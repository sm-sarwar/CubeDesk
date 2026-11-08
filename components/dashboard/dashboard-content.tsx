import { ordersService } from "@/app/service/orders.service";
import { customerService } from "@/app/service/customers.service";
import { buildDashboard } from "@/lib/dashboard";
import type { Customer } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { DashboardView } from "./dashboard-view";


export async function DashboardContent() {
  const [ordersRes, customersRes] = await Promise.all([
    ordersService.getOrders(),
    customerService.getCustomers(),
  ]);

  if (ordersRes.error || customersRes.error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load dashboard data. Please try again.
      </div>
    );
  }

  const orders: OrderWithCustomer[] = ordersRes.data?.data ?? [];
  const customers: Customer[] = customersRes.data?.data ?? [];

  return <DashboardView data={buildDashboard(orders, customers, Date.now())} />;
}