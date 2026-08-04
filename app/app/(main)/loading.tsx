import { ComicCardSkeletonGrid } from "@/components/catalog/comic-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 pb-10 pt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-end">
          <Skeleton className="h-48 w-32 flex-shrink-0 sm:h-60 sm:w-40" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-5 w-32" />
        <ComicCardSkeletonGrid />
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-4 h-5 w-32" />
        <ComicCardSkeletonGrid />
      </section>
    </main>
  );
}