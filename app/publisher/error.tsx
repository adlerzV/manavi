"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-medium text-text-main">خطایی در این بخش از پنل رخ داد</p>
      <p className="max-w-sm text-sm text-text-muted">
        این خطا معمولاً به‌خاطر یک مقدار نامعتبر (مثلاً لینک تصویر خارج از استوریج) است. بقیه پنل همچنان در دسترس است.
      </p>
      <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        تلاش دوباره
      </button>
    </div>
  );
}