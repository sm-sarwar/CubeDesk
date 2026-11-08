import { Suspense } from "react";
import { CustomersContent } from "@/components/customers/customers-content";
import { CustomersSkeleton } from "@/components/customers/customers-skeleton";

export default function CustomersPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<CustomersSkeleton />}>
        <CustomersContent />
      </Suspense>
    </div>
  );
}