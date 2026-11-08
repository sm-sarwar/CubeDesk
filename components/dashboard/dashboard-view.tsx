import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/orders/status-badge";
import { capitalize, formatDate, formatTaka, sourceBadgeClass } from "@/lib/customers";
import { orderDue } from "@/lib/orders";
import { BUCKETS } from "@/lib/due";
import type { DashboardData } from "@/lib/dashboard";
import { DonutChart, GroupedBars } from "./charts";
// import { DonutChart, GroupedBars } from "./charts";

export function DashboardView({ data }: { data: DashboardData }) {
  const collectedPct = data.sales > 0 ? Math.round((data.collected / data.sales) * 100) : 0;
  const channelTotal = data.channels.reduce((s, c) => s + c.value, 0);
  const statusTotal = data.statuses.reduce((s, c) => s + c.value, 0);
  const topDue = data.dueGroups.slice(0, 5);
  const topCustomerMax = Math.max(...data.topCustomers.map((c) => c.value), 1);
  const divisionMax = Math.max(...data.divisions.map((d) => d.value), 1);
  const { delta } = data.orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Snapshot of every customer, order and outstanding due across your channels.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-4" />}
          iconClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
          label="Total customers"
          value={String(data.totalCustomers)}
          hint={`${data.dueGroups.length} with pending due`}
        />

        <StatCard
          icon={<BadgeCheck className="size-4" />}
          iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
          label="Revenue collected"
          value={formatTaka(data.collected)}
          hint={`${collectedPct}% of ${formatTaka(data.sales)} sales`}
        >
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#079E8D]"
              style={{ width: `${collectedPct}%` }}
            />
          </div>
        </StatCard>

        <StatCard
          icon={<Clock className="size-4" />}
          iconClass="bg-orange-100 text-[#E0663E] dark:bg-orange-900/30"
          label="Outstanding due"
          value={formatTaka(data.due)}
          valueClass="text-[#E0663E]"
          hint="Yet to be collected"
        />

        <StatCard
          icon={<ShoppingBag className="size-4" />}
          iconClass="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200"
          label={data.orders.label}
          value={String(data.orders.count)}
          hint={
            delta === null ? (
              "No earlier month to compare"
            ) : (
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${
                  delta >= 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {delta >= 0 ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {Math.abs(delta)}% vs last month
              </span>
            )
          }
        />
      </div>

      {/* Revenue trend + status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Revenue trend" subtitle="Billed vs collected, last 6 months" className="lg:col-span-2">
          <GroupedBars
            data={data.monthly.map((m) => ({ label: m.label, a: m.billed, b: m.collected }))}
            aLabel="Billed"
            bLabel="Collected"
            aColor="#034E44"
            bColor="#2DD4BF"
          />
        </Card>

        <Card title="Orders by status" subtitle={`${statusTotal} orders in total`}>
          {statusTotal > 0 ? (
            <>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {data.statuses.map((s) => (
                  <div
                    key={s.status}
                    style={{ width: `${(s.value / statusTotal) * 100}%`, background: s.color }}
                    title={`${s.label}: ${s.value}`}
                  />
                ))}
              </div>
              <ul className="mt-5 space-y-3">
                {data.statuses.map((s) => (
                  <li key={s.status} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{s.value}</span>
                      <span className="w-9 text-right text-xs text-muted-foreground">
                        {Math.round((s.value / statusTotal) * 100)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty text="No orders yet." />
          )}
        </Card>
      </div>

      {/* Channel + highest due */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Sales by channel" subtitle="Cancelled orders excluded">
          {data.channels.length > 0 ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <DonutChart
                data={data.channels}
                centerValue={formatTaka(channelTotal)}
                centerLabel="Total"
              />
              <ul className="w-full flex-1 space-y-3">
                {data.channels.map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-sm" style={{ background: c.color }} />
                      {c.label}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono font-medium">{formatTaka(c.value)}</span>
                      <span className="w-9 text-right text-xs text-muted-foreground">
                        {Math.round((c.value / channelTotal) * 100)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Empty text="No sales yet." />
          )}
        </Card>

        <Card
          title="Highest outstanding due"
          action={
            <Link
              href="/due-tracker"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#079E8D] hover:underline"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {topDue.length > 0 ? (
            <ul className="divide-y">
              {topDue.map((g) => (
                <li key={g.customer.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{g.customer.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{g.customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${BUCKETS[g.bucket].badge}`}
                    >
                      {BUCKETS[g.bucket].label}
                    </span>
                    <span className="font-mono font-semibold text-[#E0663E]">
                      {formatTaka(g.due)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="All clear! No pending dues." />
          )}
        </Card>
      </div>

      {/* Top customers + divisions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top customers" subtitle="By total spent">
          {data.topCustomers.length > 0 ? (
            <ul className="space-y-4">
              {data.topCustomers.map((c, i) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {i + 1}
                      </span>
                      <span className="truncate font-semibold">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.orders} {c.orders === 1 ? "order" : "orders"}
                      </span>
                    </span>
                    <span className="font-mono font-medium">{formatTaka(c.value)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#034E44] to-[#079E8D]"
                      style={{ width: `${(c.value / topCustomerMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No customers yet." />
          )}
        </Card>

        <Card title="Sales by division" subtitle="Where your buyers are">
          {data.divisions.length > 0 ? (
            <ul className="space-y-4">
              {data.divisions.map((d) => (
                <li key={d.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.label}</span>
                    <span className="font-mono">{formatTaka(d.value)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#2F66B8]"
                      style={{ width: `${(d.value / divisionMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="No data yet." />
          )}
        </Card>
      </div>

      {/* Recent orders */}
      <Card
        title="Recent orders"
        action={
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#079E8D] hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {["Customer", "Date", "Channel", "Total", "Due", "Status"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.recent.map((o) => {
                  const due = orderDue(o);
                  const cancelled = o.status === "cancelled";
                  return (
                    <TableRow key={o.id} className={`h-14 ${cancelled ? "opacity-60" : ""}`}>
                      <TableCell className="font-semibold">{o.customer?.name ?? "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{formatDate(o.orderDate)}</TableCell>
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
                      <TableCell className="font-mono font-medium">
                        {formatTaka(Number(o.totalAmount) || 0)}
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
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Card({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-5 shadow-xs ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  valueClass = "",
  hint,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  valueClass?: string;
  hint: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs transition hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 font-mono text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}