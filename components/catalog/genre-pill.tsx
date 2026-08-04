import Link from "next/link";

export function GenrePill({ id, name }: { id: string; name: string }) {
  return (
    <Link
      href={`/app/explore?genre=${id}`}
      className="rounded-full bg-surface px-3 py-1 text-xs text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"
    >
      {name}
    </Link>
  );
}