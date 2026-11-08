"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/orders/status-badge";
import { WhatsAppIcon } from "./whatsapp-icon";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import {
  capitalize,
  formatDate,
  formatTaka,
  sourceBadgeClass,
  whatsappLink,
} from "@/lib/customers";
import type { CustomerRow } from "@/types/customer";

type Props = {
  customer: CustomerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDeleted: () => void;
};

export function CustomerDetailsSheet({
  customer,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {customer && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">{customer.name}</SheetTitle>
              <SheetDescription className="font-mono">{customer.phone}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-teal-50 p-4 dark:bg-teal-950/40">
                  <p className="text-xs text-muted-foreground">Total spent</p>
                  <p className="mt-1 font-mono text-xl font-bold">
                    {formatTaka(customer.totalSpent)}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/30">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p
                    className={`mt-1 font-mono text-xl font-bold ${
                      customer.due > 0 ? "text-[#E0663E]" : "text-muted-foreground"
                    }`}
                  >
                    {formatTaka(customer.due)}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappLink(customer.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366]/15 py-2 text-sm font-medium text-[#128C4A] underline transition hover:bg-[#25D366]/25 dark:text-[#25D366]"
              >
                <WhatsAppIcon className="size-4" />
                Message on WhatsApp
              </a>

              {/* Edit / Delete */}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={onEdit}>
                  <Pencil className="mr-1.5 size-4" />
                  Edit
                </Button>
                <DeleteCustomerDialog customer={customer} onDeleted={onDeleted} />
              </div>

              {/* Contact details */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact details
                </h3>
                <dl className="text-sm">
                  <Row label="Address">
                    <span className="text-right font-medium">{customer.address ?? "-"}</span>
                  </Row>
                  <Row label="Division">
                    <span className="font-medium">{customer.division ?? "-"}</span>
                  </Row>
                  <Row label="Channel">
                    {customer.source ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceBadgeClass(
                          customer.source
                        )}`}
                      >
                        {capitalize(customer.source)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </Row>
                  <Row label="Customer since" last>
                    <span className="font-mono font-medium">{formatDate(customer.createdAt)}</span>
                  </Row>
                </dl>
              </section>

              {/* Order history */}
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Order history ({customer.orders.length})
                </h3>

                {customer.orders.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {customer.orders.map((o) => {
                      const due = Math.max(Number(o.totalAmount) - Number(o.paidAmount), 0);
                      return (
                        <li key={o.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-mono text-base font-semibold">
                              {formatTaka(Number(o.totalAmount))}
                            </p>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>
                              {formatDate(o.orderDate)}
                              {customer.source && ` · ${capitalize(customer.source)}`}
                            </span>
                            {o.status === "cancelled" ? (
                              <span>-</span>
                            ) : due > 0 ? (
                              <span className="font-mono font-semibold text-[#E0663E]">
                                Due {formatTaka(due)}
                              </span>
                            ) : (
                              <span>Paid in full</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2.5 ${last ? "" : "border-b"}`}>
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}