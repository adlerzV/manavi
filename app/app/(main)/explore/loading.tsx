import { ComicCardSkeletonGrid } from "@/components/catalog/comic-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-6 h-10 w-full" />
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>
        <ComicCardSkeletonGrid count={12} />
      </div>
    </main>
  );
}