"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Gem, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/shop", label: "Shop", icon: Gem },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 text-xs"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-primary" : "text-text-muted"}
              />
              <span className={active ? "text-primary" : "text-text-muted"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}