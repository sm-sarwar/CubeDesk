import { customerService } from "@/app/service/customers.service";

import type { Customer } from "@/types/customer";
import { CustomersTable } from "./customers-table";

type Props = {
  searchParams: Promise<{ search?: string; source?: string }>;
};

export async function CustomersList({ searchParams }: Props) {
  const { search, source } = await searchParams;
  const { data, error } = await customerService.getCustomers({ search, source });

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  const customers: Customer[] = data?.data ?? [];

  if (customers.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
        No customers found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Total customers: <span className="font-medium text-foreground">{customers.length}</span>
      </p>
      <CustomersTable customers={customers} />
    </div>
  );
}