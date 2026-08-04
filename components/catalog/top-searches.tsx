import Link from "next/link";
import type { TopSearchTerm } from "@/app/actions/search";

export function TopSearches({ terms }: { terms: TopSearchTerm[] }) {
  if (terms.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {terms.map((item) => (
        <Link
          key={item.term}
          href={`/app/explore?q=${encodeURIComponent(item.term)}`}
          className="flex-shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-main hover:border-primary"
        >
          {item.term}
        </Link>
      ))}
    </div>
  );
}