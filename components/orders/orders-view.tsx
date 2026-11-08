"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Clock, Pencil, ShoppingBag, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  capitalize,
  formatDate,
  formatTaka,
  sourceBadgeClass,
} from "@/lib/customers";
import { orderDue, summarizeOrders } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/validations/order";
import type { Customer } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { EditOrderSheet } from "./edit-order-sheet";
import { NewOrderSheet } from "./new-order-sheet";
import { StatusBadge } from "./status-badge";

const selectClass =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  orders: OrderWithCustomer[];
  customers: Customer[];
};

export function OrdersView({ orders, customers }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Edit panel
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const editing = orders.find((o) => o.id === editId) ?? null;

  function openEdit(id: number) {
    setEditId(id);
    setEditOpen(true);
  }

  const stats = useMemo(() => summarizeOrders(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...orders]
      .sort(
        (a, b) =>
          +new Date(b.orderDate) - +new Date(a.orderDate) || b.id - a.id
      )
      .filter((o) => {
        if (status && o.status !== status) return false;
        if (
          q &&
          !o.customer?.name.toLowerCase().includes(q) &&
          !o.customer?.phone.includes(q)
        ) {
          return false;
        }
        return true;
      });
  }, [orders, search, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Every order placed across your website, Daraz and Facebook shop.
          </p>
        </div>
        <NewOrderSheet customers={customers} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<ShoppingBag className="size-4" />}
          label="Orders"
          value={String(stats.count)}
          hint={`${stats.pending} pending`}
          iconClass="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
        />
        <StatCard
          icon={<Wallet className="size-4" />}
          label="Total sales"
          value={formatTaka(stats.sales)}
          hint="Excluding cancelled"
          iconClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
        />
        <StatCard
          icon={<BadgeCheck className="size-4" />}
          label="Collected"
          value={formatTaka(stats.collected)}
          hint={
            stats.sales > 0
              ? `${Math.round((stats.collected / stats.sales) * 100)}% of sales`
              : "-"
          }
          iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Outstanding due"
          value={formatTaka(stats.due)}
          valueClass={stats.due > 0 ? "text-[#E0663E]" : undefined}
          hint="Yet to be collected"
          iconClass="bg-orange-100 text-[#E0663E] dark:bg-orange-900/30"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {capitalize(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {[
                "Customer",
                "Date",
                "Channel",
                "Total",
                "Paid",
                "Due",
                "Status",
                "",
              ].map((h, i) => (
                <TableHead
                  key={i}
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => {
                const total = Number(o.totalAmount) || 0;
                const paid = Number(o.paidAmount) || 0;
                const due = orderDue(o);
                const cancelled = o.status === "cancelled";
                const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

                return (
                  <TableRow
                    key={o.id}
                    className={`h-14 hover:bg-muted/40 ${cancelled ? "opacity-60" : ""}`}
                  >
                    <TableCell className="font-semibold">
                      {o.customer?.name ?? "-"}
                    </TableCell>

                    <TableCell className="font-mono text-sm">
                      {formatDate(o.orderDate)}
                    </TableCell>

                    <TableCell>
                      {o.customer?.source ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceBadgeClass(
                            o.customer.source
                          )}`}
                        >
                          {capitalize(o.customer.source)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell
                      className={`font-mono font-medium ${cancelled ? "line-through" : ""}`}
                    >
                      {formatTaka(total)}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono font-medium">{formatTaka(paid)}</div>
                      {!cancelled && (
                        <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-[#079E8D]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-mono font-medium">
                      {!cancelled && due > 0 ? (
                        <span className="text-[#E0663E]">{formatTaka(due)}</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(o.id)}
                        aria-label={`Edit order ${o.id}`}
                        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <EditOrderSheet
        order={editing}
        customers={customers}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconClass}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-2 font-mono text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}