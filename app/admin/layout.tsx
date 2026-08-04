import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/publishers", label: "ناشران" },
  { href: "/admin/licenses", label: "لایسنس‌ها" },
  { href: "/admin/comics", label: "عناوین" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/transactions", label: "تراکنش‌ها" },
  { href: "/admin/analytics", label: "آمار" },
  { href: "/admin/payouts", label: "تسویه‌حساب" },
  { href: "/admin/broadcast", label: "پیام همگانی" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-text-main hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}