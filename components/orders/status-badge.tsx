import type { OrderStatus } from "@/types/customer";

const STYLES: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  shipped: {
    label: "Shipped",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    dot: "bg-red-500",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STYLES[status] ?? STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}