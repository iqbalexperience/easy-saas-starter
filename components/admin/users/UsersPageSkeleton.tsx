// components/admin/users/UsersPageSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="border rounded-lg">
        <Skeleton className="h-[500px] w-full" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[300px]" />
      </div>
    </div>
  );
}
