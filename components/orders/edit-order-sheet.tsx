"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { capitalize, formatDate, formatTaka } from "@/lib/customers";
import {
  ORDER_STATUSES,
  makeOrderUpdateSchema,
  type OrderUpdateInput,
} from "@/lib/validations/order";
import type { Customer } from "@/types/customer";
import type { OrderWithCustomer } from "@/types/order";
import { updateOrder } from "@/actions/order.actions";

const selectClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  order: OrderWithCustomer | null;
  customers: Customer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditOrderSheet({ order, customers, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {order && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Edit order #{order.id}</SheetTitle>
              <SheetDescription>
                {order.customer?.name} · {formatDate(order.orderDate)}
              </SheetDescription>
            </SheetHeader>

            <EditOrderForm
              key={order.id}
              order={order}
              customers={customers}
              onDone={() => onOpenChange(false)}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EditOrderForm({
  order,
  customers,
  onDone,
}: {
  order: OrderWithCustomer;
  customers: Customer[];
  onDone: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const paid = Number(order.paidAmount) || 0;
  const schema = useMemo(() => makeOrderUpdateSchema(paid), [paid]);

  const form = useForm({
    defaultValues: {
      customerId: String(order.customerId),
      orderDate: formatDate(order.orderDate),
      totalAmount: String(Number(order.totalAmount)),
      status: order.status,
      notes: order.notes ?? "",
    } as OrderUpdateInput,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const res = await updateOrder(order.id, value);
      if (!res.ok) {
        setServerError(res.message);
        return;
      }
      onDone();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5 px-4 pb-6"
    >
      <FieldGroup>
        {/* Customer */}
        <form.Field name="customerId">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Customer</FieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={selectClass}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name} — {c.phone}
                    </option>
                  ))}
                </select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* Date + Total */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="orderDate">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Order date</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="totalAmount">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Total amount (৳)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </div>

        {/* Paid (read-only) + live due */}
        <form.Subscribe selector={(s) => s.values.totalAmount}>
          {(total) => {
            const due = Math.max((Number(total) || 0) - paid, 0);
            return (
              <div className="space-y-2 rounded-lg bg-muted/60 px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Already paid</span>
                  <span className="font-mono font-semibold">{formatTaka(paid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due after edit</span>
                  <span
                    className={`font-mono font-bold ${
                      due > 0 ? "text-[#E0663E]" : "text-emerald-600"
                    }`}
                  >
                    {due > 0 ? formatTaka(due) : "Paid in full"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid amount payment record diye bare, ekhane edit kora jay na.
                </p>
              </div>
            );
          }}
        </form.Subscribe>

        {/* Status */}
        <form.Field name="status">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as OrderUpdateInput["status"])
                }
                className={selectClass}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {capitalize(s)}
                  </option>
                ))}
              </select>
              {field.state.value === "cancelled" && (
                <p className="text-xs text-amber-600">
                  Cancelled order sales, due ar customer total theke bad jabe.
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Notes */}
        <form.Field name="notes">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  placeholder="e.g. Advance diyeche, baki delivery te"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      {serverError && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#079E8D] text-white hover:bg-[#068a7b]"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}