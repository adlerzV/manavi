"use client";

import { useState } from "react";
import type { AgeRating } from "@prisma/client";
import { updateContentPreference } from "@/app/actions/profile";

const OPTIONS: { value: AgeRating; label: string }[] = [
  { value: "NORMAL", label: "عادی" },
  { value: "EIGHTEEN_PLUS", label: "۱۸+" },
  { value: "NSFW", label: "بدون محدودیت" },
];

export function ContentPreferenceForm({ current }: { current: AgeRating }) {
  const [value, setValue] = useState<AgeRating>(current);
  const [pending, setPending] = useState(false);

  async function handleChange(next: AgeRating) {
    setValue(next);
    setPending(true);
    await updateContentPreference(next).catch(() => {});
    setPending(false);
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          disabled={pending}
          className={`rounded-md border px-3 py-2 text-sm disabled:opacity-50 ${
            value === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-text-main"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}