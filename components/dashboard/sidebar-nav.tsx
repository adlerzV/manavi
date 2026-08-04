"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  FileSignature,
  BookOpen,
  Users,
  Receipt,
  BarChart3,
  Wallet,
  Megaphone,
  Tags,
  UserCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  FileSignature,
  BookOpen,
  Users,
  Receipt,
  BarChart3,
  Wallet,
  Megaphone,
  Tags,
  UserCircle,
};

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  title: string;
}

export function SidebarNav({ items, title }: SidebarNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return href === items[0].href ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-text-main hover:bg-background" aria-label="باز کردن منو">
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-text-main">{title}</span>
      </header>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col border-l border-border bg-surface transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-sm font-medium text-text-main">{title}</span>
          <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-text-muted hover:bg-background hover:text-text-main" aria-label="بستن منو">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-text-main hover:bg-background"
                }`}
              >
                {Icon && <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}