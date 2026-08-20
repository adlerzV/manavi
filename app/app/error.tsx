"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-text-main">یه مشکلی پیش اومد</p>
      <p className="max-w-sm text-sm text-text-muted">در بارگذاری این صفحه خطایی رخ داد. لطفاً دوباره تلاش کنید.</p>
      <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        تلاش دوباره
      </button>
    </main>
  );
}