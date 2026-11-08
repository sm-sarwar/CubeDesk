"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/orders/status-badge";
import { WhatsAppIcon } from "@/components/customers/whatsapp-icon";
import {
  capitalize,
  formatDate,
  formatTaka,
  sourceBadgeClass,
} from "@/lib/customers";
import { BUCKETS, ageLabel, reminderLink, type DueGroup } from "@/lib/due";

export function DueCustomerCard({ group }: { group: DueGroup }) {
  const [open, setOpen] = useState(false);
  const { customer, orders, billed, paid, due, oldestDays, bucket } = group;

  const pct = billed > 0 ? Math.min((paid / billed) * 100, 100) : 0;
  const initial = customer.name.trim().charAt(0).toUpperCase();

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs transition hover:shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Avatar + info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#034E44] to-[#079E8D] text-lg font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{customer.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">{customer.phone}</span>
              {customer.division && <span>· {customer.division}</span>}
              {customer.source && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${sourceBadgeClass(
                    customer.source
                  )}`}
                >
                  {capitalize(customer.source)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full sm:w-44">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Paid {formatTaka(paid)}</span>
            <span>of {formatTaka(billed)}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#079E8D]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Due + age */}
        <div className="flex items-center justify-between gap-3 sm:w-40 sm:flex-col sm:items-end sm:justify-center sm:gap-1">
          <p className="font-mono text-xl font-bold text-[#E0663E]">{formatTaka(due)}</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BUCKETS[bucket].badge}`}
          >
            {BUCKETS[bucket].label} · {ageLabel(oldestDays)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={reminderLink(group)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366]/15 px-4 text-sm font-medium text-[#128C4A] transition hover:bg-[#25D366] hover:text-white sm:flex-none dark:text-[#25D366] dark:hover:text-white"
          >
            <WhatsAppIcon className="size-4" />
            Remind
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide orders" : "Show orders"}
            className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted"
          >
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Orders */}
      {open && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Unpaid orders ({orders.length})
          </p>
          <ul className="space-y-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">
                    {formatDate(o.orderDate)}
                  </span>
                  <StatusBadge status={o.status} />
                  <span className="text-xs text-muted-foreground">{ageLabel(o.days)} ago</span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <span className="text-muted-foreground">
                    {formatTaka(o.paid)} / {formatTaka(o.total)}
                  </span>
                  <span className="font-semibold text-[#E0663E]">{formatTaka(o.due)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}