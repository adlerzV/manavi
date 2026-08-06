"use client";

import { useState } from "react";
import { linkPublisherOwner, unlinkPublisherOwner } from "@/app/admin/actions/catalog-actions";

interface PublisherOwnerLinkProps {
  publisherId: string;
  ownerUsername: string | null;
}

export function PublisherOwnerLink({ publisherId, ownerUsername }: PublisherOwnerLinkProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLink() {
    setPending(true);
    setError(null);
    const result = await linkPublisherOwner(publisherId, username);
    if (result.success) {
      setOpen(false);
      setUsername("");
    } else {
      setError(result.error ?? "خطا");
    }
    setPending(false);
  }

  async function handleUnlink() {
    if (!confirm("دسترسی این کاربر به پنل ناشر قطع بشه؟")) return;
    setPending(true);
    await unlinkPublisherOwner(publisherId);
    setPending(false);
  }

  if (ownerUsername) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>مالک: @{ownerUsername}</span>
        <button onClick={handleUnlink} disabled={pending} className="text-red-400 disabled:opacity-50">قطع دسترسی</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-primary">
        اتصال به کاربر مالک
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="یوزرنیم تلگرام"
        className="w-32 rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main"
      />
      <button onClick={handleLink} disabled={pending || !username.trim()} className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50">
        تایید
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-text-muted">انصراف</button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}