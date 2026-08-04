import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav, type SidebarNavItem } from "@/components/dashboard/sidebar-nav";

const NAV: SidebarNavItem[] = [
  { href: "/publisher", label: "داشبورد", icon: "LayoutDashboard" },
  { href: "/publisher/comics", label: "آثار من", icon: "BookOpen" },
  { href: "/publisher/profile", label: "پروفایل", icon: "UserCircle" },
  { href: "/publisher/team", label: "تیم", icon: "Users" },
  { href: "/publisher/payouts", label: "تسویه‌حساب", icon: "Wallet" },
];

export default async function PublisherLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user || (!user.publisherProfile && user.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav items={NAV} title="پنل ناشر مناوی" />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}