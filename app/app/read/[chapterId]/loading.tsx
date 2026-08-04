import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Skeleton className="h-[70vh] w-full max-w-md bg-white/5" />
    </div>
  );
}