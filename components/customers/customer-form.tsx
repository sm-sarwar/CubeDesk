"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ActionResult } from "@/lib/backend";
import {
  CHANNELS,
  DIVISIONS,
  customerSchema,
  type CustomerInput,
} from "@/lib/validations/customer";

const selectClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  defaultValues: CustomerInput;
  submitLabel: string;
  pendingLabel: string;
  onSave: (value: CustomerInput) => Promise<ActionResult>;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CustomerForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  onSave,
  onSuccess,
  onCancel,
}: Props) {
  const [serverError, setServerError] = useState("");

  const form = useForm({
    defaultValues,
    validators: { onSubmit: customerSchema },
    onSubmit: async ({ value }) => {
      setServerError("");
      const res = await onSave(value);
      if (!res.ok) {
        setServerError(res.message);
        return;
      }
      onSuccess();
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
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="e.g. Rahim Uddin"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="phone">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  inputMode="numeric"
                  placeholder="e.g. 01712345678"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="address">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  placeholder="House, road, area, city"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="division">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Division</FieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as CustomerInput["division"])}
                  className={selectClass}
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
            )}
          </form.Field>

          <form.Field name="source">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Channel</FieldLabel>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as CustomerInput["source"])}
                  className={selectClass}
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>{capitalize(c)}</option>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#079E8D] text-white hover:bg-[#068a7b]"
            >
              {isSubmitting ? pendingLabel : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}