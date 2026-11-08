import { ordersService } from "@/app/service/orders.service";
import { buildDueGroups } from "@/lib/due";
import type { OrderWithCustomer } from "@/types/order";
import { DueView } from "./due-view";

export async function DueContent() {
  const { data, error } = await ordersService.getOrders();

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load dues. Please try again.
      </div>
    );
  }

  const orders: OrderWithCustomer[] = data?.data ?? [];
  const groups = buildDueGroups(orders, Date.now());

  return <DueView groups={groups} />;
}