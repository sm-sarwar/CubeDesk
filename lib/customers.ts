import type { Customer, CustomerRow, Order } from "@/types/customer";
import { CHANNELS, DIVISIONS, type CustomerInput } from "@/lib/validations/customer";
export function buildCustomerRows(
  customers: Customer[],
  orders: Order[]
): CustomerRow[] {
  const byCustomer = new Map<number, Order[]>();
  for (const o of orders) {
    const list = byCustomer.get(o.customerId) ?? [];
    list.push(o);
    byCustomer.set(o.customerId, list);
  }

  return customers.map((c) => {
    // History te shob order (notun age), kintu hishab e cancelled bad
    const all = [...(byCustomer.get(c.id) ?? [])].sort(
      (a, b) => +new Date(b.orderDate) - +new Date(a.orderDate)
    );
    const active = all.filter((o) => o.status !== "cancelled");

    const total = active.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const paid = active.reduce((s, o) => s + (Number(o.paidAmount) || 0), 0);

    return {
      ...c,
      orders: all,
      ordersCount: active.length,
      totalSpent: total,
      due: Math.max(total - paid, 0),
    };
  });
}

export const formatTaka = (n: number) => `৳${n.toLocaleString("en-US")}`;

// 01712345678 -> https://wa.me/8801712345678
export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("880") ? digits : digits.replace(/^0/, "880");
  return `https://wa.me/${intl}`;
}

// Division er alada alada banan ke ek kore nei (Chattagram / Chittagong / Chattogram)
const DIVISION_ALIASES: Record<string, string> = {
  chattagram: "chattogram",
  chittagong: "chattogram",
  chattogram: "chattogram",
  barisal: "barishal",
  barishal: "barishal",
};

export const normalizeDivision = (d?: string | null) => {
  const key = (d ?? "").trim().toLowerCase();
  return DIVISION_ALIASES[key] ?? key;
};

// "2026-08-19T00:00:00.000Z" -> "2026-08-19"
export const formatDate = (iso: string) => iso.slice(0, 10);

export const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

const SOURCE_STYLES: Record<string, string> = {
  website: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  daraz: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
};

export const sourceBadgeClass = (source: string) =>
  SOURCE_STYLES[source.toLowerCase()] ?? "bg-muted text-muted-foreground";

// Customer er data ke edit form er format e anbe.
// Purono data te "Chattagram" thakle form er "Chattogram" er sathe mile jabe.
export function toCustomerFormValues(c: Customer): CustomerInput {
  const division =
    DIVISIONS.find((d) => normalizeDivision(d) === normalizeDivision(c.division)) ?? "Dhaka";
  const source = CHANNELS.find((s) => s === c.source?.toLowerCase()) ?? "website";

  return {
    name: c.name,
    phone: c.phone,
    address: c.address ?? "",
    division,
    source,
  };
}