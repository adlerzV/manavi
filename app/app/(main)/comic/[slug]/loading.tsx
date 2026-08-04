import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <Skeleton className="h-40 w-full rounded-none sm:h-56" />
      <div className="mx-auto -mt-16 max-w-4xl px-4 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-56 w-40 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="mt-6 h-16 w-full max-w-2xl" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}