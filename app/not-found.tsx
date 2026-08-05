import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-4xl font-bold text-primary">۴۰۴</p>
      <p className="text-sm text-text-muted">صفحه‌ای که دنبالش بودید پیدا نشد.</p>
      <Link href="/app" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        بازگشت به خانه
      </Link>
    </main>
  );
}