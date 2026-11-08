import type { Customer, OrderStatus } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { formatTaka, whatsappLink } from "@/lib/customers";

export type AgeBucket = "recent" | "late" | "overdue";

export interface DueOrder {
  id: number;
  orderDate: string;
  status: OrderStatus;
  total: number;
  paid: number;
  due: number;
  days: number;
}

export interface DueGroup {
  customer: Customer;
  orders: DueOrder[];
  billed: number;
  paid: number;
  due: number;
  oldestDays: number;
  bucket: AgeBucket;
}

export const BUCKETS: Record<
  AgeBucket,
  { label: string; range: string; badge: string; bar: string }
> = {
  recent: {
    label: "Recent",
    range: "0–7 days",
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
    bar: "bg-teal-500",
  },
  late: {
    label: "Late",
    range: "8–30 days",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    bar: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    range: "30+ days",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    bar: "bg-red-500",
  },
};

export const bucketOf = (days: number): AgeBucket =>
  days <= 7 ? "recent" : days <= 30 ? "late" : "overdue";

export const ageLabel = (days: number) =>
  days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;

const DAY = 86_400_000;

export function buildDueGroups(orders: OrderWithCustomer[], now: number): DueGroup[] {
  const map = new Map<number, DueGroup>();

  for (const o of orders) {
    if (o.status === "cancelled" || !o.customer) continue;

    const total = Number(o.totalAmount) || 0;
    const paid = Number(o.paidAmount) || 0;
    const due = total - paid;
    if (due <= 0) continue;

    const days = Math.max(Math.floor((now - new Date(o.orderDate).getTime()) / DAY), 0);

    const group =
      map.get(o.customerId) ??
      ({
        customer: o.customer,
        orders: [],
        billed: 0,
        paid: 0,
        due: 0,
        oldestDays: 0,
        bucket: "recent",
      } as DueGroup);

    group.orders.push({
      id: o.id,
      orderDate: o.orderDate,
      status: o.status,
      total,
      paid,
      due,
      days,
    });
    group.billed += total;
    group.paid += paid;
    group.due += due;
    group.oldestDays = Math.max(group.oldestDays, days);
    map.set(o.customerId, group);
  }

  return [...map.values()].map((g) => ({
    ...g,
    orders: g.orders.sort((a, b) => b.days - a.days), // shobcheye purono age
    bucket: bucketOf(g.oldestDays),
  }));
}

export function summarizeDue(groups: DueGroup[]) {
  const byBucket: Record<AgeBucket, number> = { recent: 0, late: 0, overdue: 0 };
  const counts: Record<AgeBucket, number> = { recent: 0, late: 0, overdue: 0 };
  let total = 0;
  let largest: DueGroup | null = null;

  for (const g of groups) {
    total += g.due;
    byBucket[g.bucket] += g.due;
    counts[g.bucket] += 1;
    if (!largest || g.due > largest.due) largest = g;
  }

  return { total, byBucket, counts, largest, customers: groups.length };
}

// WhatsApp e ready message soho link
export function reminderLink(g: DueGroup) {
  const text =
    `আসসালামু আলাইকুম ${g.customer.name}, ` +
    `PuzzleBazar থেকে আপনার অর্ডারে ${formatTaka(g.due)} বাকি আছে। ` +
    `সুবিধামতো পরিশোধ করার অনুরোধ রইল। ধন্যবাদ।`;
  return `${whatsappLink(g.customer.phone)}?text=${encodeURIComponent(text)}`;
}