import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="relative min-h-screen bg-background text-text-main">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        <Skeleton className="h-9 w-9 rounded-full md:hidden" />
      </header>

      <section className="px-4 pb-16 pt-6 sm:pt-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-right">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-5/6 max-w-md" />
            <Skeleton className="mt-4 h-12 w-48 rounded-full" />
          </div>
          <Skeleton className="mx-auto h-[380px] w-full max-w-sm rounded-3xl sm:h-[460px]" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto h-3 w-24" />
          <Skeleton className="mx-auto mt-3 h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </main>
  );
}