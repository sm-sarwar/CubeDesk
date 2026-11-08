"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Search, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatTaka } from "@/lib/customers";
import {
  BUCKETS,
  summarizeDue,
  type AgeBucket,
  type DueGroup,
} from "@/lib/due";
import { DueCustomerCard } from "./due-customer-card";

type Filter = "all" | AgeBucket;
type Sort = "amount" | "oldest";

const selectClass =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DueView({ groups }: { groups: DueGroup[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("amount");

  const stats = useMemo(() => summarizeDue(groups), [groups]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups
      .filter((g) => {
        if (filter !== "all" && g.bucket !== filter) return false;
        if (
          q &&
          !g.customer.name.toLowerCase().includes(q) &&
          !g.customer.phone.includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) =>
        sort === "amount" ? b.due - a.due : b.oldestDays - a.oldestDays
      );
  }, [groups, search, filter, sort]);

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.customers },
    { key: "recent", label: BUCKETS.recent.label, count: stats.counts.recent },
    { key: "late", label: BUCKETS.late.label, count: stats.counts.late },
    { key: "overdue", label: BUCKETS.overdue.label, count: stats.counts.overdue },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Due Tracker</h1>
        <p className="text-muted-foreground">
          Who owes you money, how much, and for how long.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 lg:grid-cols-4">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-[#034E44] to-[#079E8D] p-5 text-white shadow-sm lg:col-span-2">
          <p className="text-sm text-white/80">Total outstanding</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-tight">
            {formatTaka(stats.total)}
          </p>

          {stats.total > 0 ? (
            <>
              {/* Aging bar */}
              <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-white/20">
                {(Object.keys(BUCKETS) as AgeBucket[]).map((b) => (
                  <div
                    key={b}
                    className={BUCKETS[b].bar}
                    style={{ width: `${(stats.byBucket[b] / stats.total) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {(Object.keys(BUCKETS) as AgeBucket[]).map((b) => (
                  <div key={b}>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className={`size-2 rounded-full ${BUCKETS[b].bar}`} />
                      {BUCKETS[b].label}
                      <span className="text-white/50">· {BUCKETS[b].range}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-sm font-semibold">
                      {formatTaka(stats.byBucket[b])}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-white/80">Nothing pending right now.</p>
          )}
        </div>

        <MiniCard
          icon={<Users className="size-4" />}
          iconClass="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
          label="Customers with due"
          value={String(stats.customers)}
          hint={
            stats.counts.overdue > 0
              ? `${stats.counts.overdue} overdue 30+ days`
              : "None overdue"
          }
        />

        <MiniCard
          icon={<TrendingUp className="size-4" />}
          iconClass="bg-orange-100 text-[#E0663E] dark:bg-orange-900/30"
          label="Largest due"
          value={stats.largest ? formatTaka(stats.largest.due) : "–"}
          hint={stats.largest?.customer.name ?? "-"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                filter === c.key
                  ? "border-[#079E8D] bg-[#079E8D] text-white"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {c.label}
              <span
                className={`ml-1.5 text-xs ${
                  filter === c.key ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className={selectClass}
        >
          <option value="amount">Highest due first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
          <CheckCircle2 className="size-9 text-emerald-500" />
          <p className="font-medium">
            {groups.length === 0 ? "All clear! No pending dues." : "No customers match."}
          </p>
          <p className="text-sm text-muted-foreground">
            {groups.length === 0
              ? "Every order has been paid in full."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((g) => (
            <DueCustomerCard key={g.customer.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniCard({
  icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`flex size-8 items-center justify-center rounded-lg ${iconClass}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}