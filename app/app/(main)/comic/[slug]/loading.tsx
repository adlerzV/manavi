import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <Skeleton className="h-40 w-full rounded-none sm:h-56" />
      <div className="mx-auto -mt-16 max-w-4xl px-4 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-56 w-40 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-40" />
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="mb-4 flex gap-6 border-b border-border pb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <Skeleton className="h-16 w-full max-w-2xl" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}