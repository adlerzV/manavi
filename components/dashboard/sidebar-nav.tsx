"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  Layers,
  UserCircle,
  Globe,
  MessageSquare,
  Gem,
  Coins,
  CheckCircle2,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, FileSignature, BookOpen, Users, Receipt,
  BarChart3, Wallet, Megaphone, Tags, Layers, UserCircle, MessageSquare, Gem, Coins, CheckCircle2, ScrollText,
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

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`}
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M14 4v16" />
      <path d="M17.5 10.5 19.5 12 17.5 13.5" />
    </svg>
  );
}

export function SidebarNav({ items, title }: SidebarNavProps) {
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const expanded = pinned || hovered;

  function isActive(href: string) {
    return href === items[0].href ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:hidden">
        <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-text-main hover:bg-background" aria-label="باز کردن منو">
          <ToggleIcon open={false} />
        </button>
        <span className="text-sm font-medium text-text-main">{title}</span>
      </header>

      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 sm:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-border bg-surface transition-all duration-300 ease-out max-w-[85vw]
          ${mobileOpen ? "translate-x-0" : "translate-x-full sm:translate-x-0"}
          ${expanded ? "w-64" : "w-[68px]"}`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-3">
          <span className={`overflow-hidden whitespace-nowrap text-sm font-medium text-text-main transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
            {title}
          </span>
          <button
            onClick={() => {
              setPinned((prev) => !prev);
              setMobileOpen(false);
            }}
            className="flex-shrink-0 rounded-md p-1.5 text-text-muted hover:bg-background hover:text-text-main"
            aria-label={pinned ? "جمع کردن منو" : "باز کردن منو"}
          >
            <ToggleIcon open={pinned} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-2.5">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-text-main hover:bg-background"
                }`}
              >
                {Icon && <Icon size={19} strokeWidth={active ? 2.4 : 1.8} className="flex-shrink-0" />}
                <span className={`overflow-hidden whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-background hover:text-text-main"
          >
            <Globe size={19} strokeWidth={1.8} className="flex-shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
              بازگشت به سایت
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}