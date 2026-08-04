import { ComicCardSkeletonGrid } from "@/components/catalog/comic-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-4 h-10 w-full" />

        <div className="mb-6">
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 flex-shrink-0 rounded-full" />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-hidden" style={{ gridAutoColumns: "88px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="aspect-square w-[72px] rounded-xl" />
                <Skeleton className="h-2.5 w-[60px]" />
              </div>
            ))}
          </div>
        </div>

        <ComicCardSkeletonGrid count={12} />
      </div>
    </main>
  );
}