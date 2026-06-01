import { Suspense } from "react";
import { FleetIntelligencePage } from "@/features/ai-insights/FleetIntelligencePage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-20 h-96 max-w-4xl" />}>
      <FleetIntelligencePage />
    </Suspense>
  );
}
