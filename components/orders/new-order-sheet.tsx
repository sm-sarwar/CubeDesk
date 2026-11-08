"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ORDER_STATUSES,
  orderSchema,
  type OrderInput,
} from "@/lib/validations/order";
import { capitalize, formatTaka, sourceBadgeClass } from "@/lib/customers";
import type { Customer } from "@/types/customer";
import { createOrder } from "@/actions/order.actions";

const selectClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const defaultValues: OrderInput = {
  customerId: "",
  totalAmount: "",
  paidAmount: "0",
  status: "pending",
};

export function NewOrderSheet({ customers }: { customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues,
    validators: { onSubmit: orderSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const res = await createOrder(value);

      if (!res.ok) {
        setServerError(res.message);
        return;
      }

      form.reset();
      setOpen(false);
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      setServerError("");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="bg-[#079E8D] text-white hover:bg-[#068a7b]">
          <Plus className="mr-1 size-4" />
          New order
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">New order</SheetTitle>
          <SheetDescription>Log a purchase against a customer</SheetDescription>
        </SheetHeader>

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
                      <option value="">Select customer</option>
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

            {/* Total + Paid */}
            <div className="grid grid-cols-2 gap-3">
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
                        placeholder="1500"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="paidAmount">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Paid amount (৳)</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        placeholder="1000"
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

            {/* Live due preview */}
            <form.Subscribe selector={(s) => [s.values.totalAmount, s.values.paidAmount]}>
              {([total, paid]) => {
                const due = Math.max((Number(total) || 0) - (Number(paid) || 0), 0);
                return (
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Due after this order</span>
                    <span
                      className={`font-mono font-bold ${
                        due > 0 ? "text-[#E0663E]" : "text-emerald-600"
                      }`}
                    >
                      {due > 0 ? formatTaka(due) : "Paid in full"}
                    </span>
                  </div>
                );
              }}
            </form.Subscribe>

            {/* Channel (auto) + Status */}
            <div className="grid grid-cols-2 gap-3">
              <form.Subscribe selector={(s) => s.values.customerId}>
                {(customerId) => {
                  const source = customers.find((c) => String(c.id) === customerId)?.source;
                  return (
                    <Field>
                      <FieldLabel>Channel</FieldLabel>
                      <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3">
                        {source ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceBadgeClass(
                              source
                            )}`}
                          >
                            {capitalize(source)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Auto</span>
                        )}
                      </div>
                    </Field>
                  );
                }}
              </form.Subscribe>

              <form.Field name="status">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value as OrderInput["status"])
                      }
                      className={selectClass}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {capitalize(s)}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </form.Field>
            </div>
          </FieldGroup>

          {serverError && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#079E8D] text-white hover:bg-[#068a7b]"
                >
                  {isSubmitting ? "Saving..." : "Save order"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}