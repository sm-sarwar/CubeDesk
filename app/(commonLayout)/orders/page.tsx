import { Suspense } from "react";
import { OrdersContent } from "@/components/orders/orders-content";
import { OrdersSkeleton } from "@/components/orders/orders-skeleton";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}