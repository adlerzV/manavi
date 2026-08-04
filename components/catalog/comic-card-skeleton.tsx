import { Skeleton } from "@/components/ui/skeleton";

export function ComicCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="mt-2 h-3 w-3/4" />
    </div>
  );
}

export function ComicCardSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ComicCardSkeleton key={i} />
      ))}
    </div>
  );
}