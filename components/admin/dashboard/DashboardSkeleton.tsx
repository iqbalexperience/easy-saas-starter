// components/admin/dashboard/DashboardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end mb-6">
        <Skeleton className="h-10 w-[180px]" />
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
        ))}
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-[400px] w-full rounded-lg" />

      {/* Tabs and Tables */}
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}
