import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav, type SidebarNavItem } from "@/components/dashboard/sidebar-nav";

const NAV: SidebarNavItem[] = [
  { href: "/admin", label: "داشبورد", icon: "LayoutDashboard" },
  { href: "/admin/publishers", label: "ناشران", icon: "Building2" },
  { href: "/admin/licenses", label: "لایسنس‌ها", icon: "FileSignature" },
  { href: "/admin/comics", label: "عناوین", icon: "BookOpen" },
  { href: "/admin/genres", label: "دسته‌بندی‌ها", icon: "Tags" },
  { href: "/admin/comments", label: "نظرات", icon: "MessageSquare" },
  { href: "/admin/users", label: "کاربران", icon: "Users" },
  { href: "/admin/transactions", label: "تراکنش‌ها", icon: "Receipt" },
  { href: "/admin/analytics", label: "آمار", icon: "BarChart3" },
  { href: "/admin/payouts", label: "تسویه‌حساب", icon: "Wallet" },
  { href: "/admin/broadcast", label: "پیام همگانی", icon: "Megaphone" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background sm:pr-[68px]">
      <SidebarNav items={NAV} title="پنل مدیریت مناوی" />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}