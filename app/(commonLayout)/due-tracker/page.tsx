import { Suspense } from "react";
import { DueContent } from "@/components/due/due-content";
import { DueSkeleton } from "@/components/due/due-skeleton";

export default function DueTrackerPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<DueSkeleton />}>
        <DueContent />
      </Suspense>
    </div>
  );
}