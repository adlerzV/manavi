import Link from "next/link";

export function AgeVerificationGate({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-text-main">این محتوا مخصوص بزرگسالان است</p>
      <p className="max-w-sm text-sm text-text-muted">
        {isAuthenticated
          ? "برای مشاهدهٔ این چپتر باید از صفحهٔ پروفایل، تاییدیهٔ سنی (۱۸+) را فعال کنید."
          : "برای مشاهدهٔ این چپتر ابتدا باید این صفحه را از داخل تلگرام باز کنید تا وارد حساب خود شوید."}
      </p>

      {isAuthenticated ? (
        <Link
          href="/app/profile"
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          رفتن به تنظیمات پروفایل
        </Link>
      ) : (
        <p className="text-xs text-text-muted">این صفحه را از داخل مینی‌اپ مناوی در تلگرام باز کنید.</p>
      )}
    </div>
  );
}