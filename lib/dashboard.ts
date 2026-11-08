import type { Customer, OrderStatus } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { buildDueGroups, type DueGroup } from "@/lib/due";
import { capitalize, normalizeDivision } from "@/lib/customers";
import { ORDER_STATUSES } from "@/lib/validations/order";

export interface Slice {
  label: string;
  value: number;
  color: string;
}

export const CHANNEL_COLORS: Record<string, string> = {
  website: "#079E8D",
  daraz: "#DB9A3E",
  facebook: "#2F66B8",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#F59E0B",
  shipped: "#3B82F6",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

export interface DashboardData {
  totalCustomers: number;
  sales: number;
  collected: number;
  due: number;
  orders: { count: number; label: string; delta: number | null };
  monthly: { label: string; billed: number; collected: number }[];
  channels: Slice[];
  statuses: (Slice & { status: OrderStatus })[];
  divisions: { label: string; value: number }[];
  topCustomers: { id: number; name: string; phone: string; value: number; orders: number }[];
  dueGroups: DueGroup[];
  recent: OrderWithCustomer[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const num = (v: string) => Number(v) || 0;
const monthKey = (iso: string) => iso.slice(0, 7); // "2026-06"
const monthLabel = (key: string) => MONTHS[Number(key.slice(5, 7)) - 1];

function shiftMonth(key: string, delta: number) {
  let y = Number(key.slice(0, 4));
  let m = Number(key.slice(5, 7)) - 1 + delta;
  y += Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

export function buildDashboard(
  orders: OrderWithCustomer[],
  customers: Customer[],
  now: number
): DashboardData {
  const active = orders.filter((o) => o.status !== "cancelled");

  const sales = active.reduce((s, o) => s + num(o.totalAmount), 0);
  const collected = active.reduce((s, o) => s + num(o.paidAmount), 0);

  // Reference month: ei mash e order thakle ei mash, na thakle shesh order er mash
  const nowKey = new Date(now).toISOString().slice(0, 7);
  const keys = active.map((o) => monthKey(o.orderDate)).sort();
  const latestKey = keys.length ? keys[keys.length - 1] : nowKey;
  const isCurrent = keys.includes(nowKey);
  const refKey = isCurrent ? nowKey : latestKey;

  // Last 6 months
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const key = shiftMonth(refKey, i - 5);
    const inMonth = active.filter((o) => monthKey(o.orderDate) === key);
    return {
      label: monthLabel(key),
      billed: inMonth.reduce((s, o) => s + num(o.totalAmount), 0),
      collected: inMonth.reduce((s, o) => s + num(o.paidAmount), 0),
    };
  });

  const countIn = (key: string) => active.filter((o) => monthKey(o.orderDate) === key).length;
  const cur = countIn(refKey);
  const prev = countIn(shiftMonth(refKey, -1));

  // Channel (customer er source theke)
  const channelMap = new Map<string, number>();
  for (const o of active) {
    const key = (o.customer?.source ?? "other").toLowerCase();
    channelMap.set(key, (channelMap.get(key) ?? 0) + num(o.totalAmount));
  }
  const channels: Slice[] = [...channelMap.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      label: capitalize(k),
      value: v,
      color: CHANNEL_COLORS[k] ?? "#94A3B8",
    }));

  // Status (cancelled shoho shob order)
  const statuses = ORDER_STATUSES.map((s) => ({
    status: s,
    label: capitalize(s),
    value: orders.filter((o) => o.status === s).length,
    color: STATUS_COLORS[s],
  }));

  // Division
  const divMap = new Map<string, number>();
  for (const o of active) {
    const key = normalizeDivision(o.customer?.division);
    if (!key) continue;
    divMap.set(key, (divMap.get(key) ?? 0) + num(o.totalAmount));
  }
  const divisions = [...divMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => ({ label: capitalize(k), value: v }));

  // Top customers
  const custMap = new Map<number, { id: number; name: string; phone: string; value: number; orders: number }>();
  for (const o of active) {
    if (!o.customer) continue;
    const e = custMap.get(o.customerId) ?? {
      id: o.customerId,
      name: o.customer.name,
      phone: o.customer.phone,
      value: 0,
      orders: 0,
    };
    e.value += num(o.totalAmount);
    e.orders += 1;
    custMap.set(o.customerId, e);
  }
  const topCustomers = [...custMap.values()].sort((a, b) => b.value - a.value).slice(0, 5);

  const dueGroups = buildDueGroups(orders, now).sort((a, b) => b.due - a.due);

  const recent = [...orders]
    .sort((a, b) => +new Date(b.orderDate) - +new Date(a.orderDate) || b.id - a.id)
    .slice(0, 6);

  return {
    totalCustomers: customers.length,
    sales,
    collected,
    due: Math.max(sales - collected, 0),
    orders: {
      count: cur,
      label: isCurrent ? "Orders this month" : `Orders in ${monthLabel(refKey)} ${refKey.slice(0, 4)}`,
      delta: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null,
    },
    monthly,
    channels,
    statuses,
    divisions,
    topCustomers,
    dueGroups,
    recent,
  };
}