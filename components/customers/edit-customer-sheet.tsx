"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toCustomerFormValues } from "@/lib/customers";
import type { CustomerRow } from "@/types/customer";
import { CustomerForm } from "./customer-form";
import { updateCustomer } from "@/actions/customer.actions";

type Props = {
  customer: CustomerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditCustomerSheet({ customer, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {customer && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Edit customer</SheetTitle>
              <SheetDescription>Update {customer.name}&apos;s details</SheetDescription>
            </SheetHeader>

            <CustomerForm
              key={customer.id}
              defaultValues={toCustomerFormValues(customer)}
              submitLabel="Save changes"
              pendingLabel="Saving..."
              onSave={(value) => updateCustomer(customer.id, value)}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}