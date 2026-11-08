"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CustomerInput } from "@/lib/validations/customer";
import { CustomerForm } from "./customer-form";
import { createCustomer } from "@/actions/customer.actions";

const emptyCustomer: CustomerInput = {
  name: "",
  phone: "",
  address: "",
  division: "Dhaka",
  source: "website",
};

export function AddCustomerSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-[#079E8D] text-white hover:bg-[#068a7b]">
          <Plus className="mr-1 size-4" />
          Add customer
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Add customer</SheetTitle>
          <SheetDescription>Create a new customer record</SheetDescription>
        </SheetHeader>

        <CustomerForm
          defaultValues={emptyCustomer}
          submitLabel="Save customer"
          pendingLabel="Saving..."
          onSave={createCustomer}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}