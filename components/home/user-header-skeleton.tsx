import { Skeleton } from "@/components/ui/skeleton";

export function UserHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </header>
  );
}