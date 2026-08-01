"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "age-gate-confirmed";

export function AgeGate({ children }: { children: ReactNode }) {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    setConfirmed(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function confirm() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setConfirmed(true);
  }

  if (confirmed === null) {
    return <div className="min-h-[240px]" />;
  }

  if (confirmed) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-md border border-border bg-surface p-8 text-center">
      <p className="text-sm text-text-main">This title contains mature content.</p>
      <button
        onClick={confirm}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        I am 18 or older — continue
      </button>
    </div>
  );
}