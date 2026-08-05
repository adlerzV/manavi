"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  triggerLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmValue: string;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  onDeleted?: () => void;
  triggerClassName?: string;
}

export function DeleteConfirmDialog({
  triggerLabel,
  confirmTitle,
  confirmDescription,
  confirmValue,
  onConfirm,
  onDeleted,
  triggerClassName,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = typed.trim() === confirmValue.trim();

  async function handleConfirm() {
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    const result = await onConfirm();
    if (result.success) {
      setOpen(false);
      setTyped("");
      onDeleted?.();
    } else {
      setError(result.error ?? "خطا در حذف");
    }
    setPending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "flex items-center gap-1 rounded-md border border-red-400 px-2 py-1 text-xs text-red-400"}
      >
        <Trash2 size={13} />
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4" onClick={() => !pending && setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-4 rounded-md border border-red-400/40 bg-surface p-6">
            <div>
              <h3 className="text-sm font-semibold text-red-400">{confirmTitle}</h3>
              <p className="mt-1 text-xs leading-6 text-text-muted">{confirmDescription}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-text-muted">برای تایید، عبارت زیر را دقیقاً وارد کنید:</p>
              <p className="select-all rounded-md bg-background px-2 py-1 text-xs text-text-main">{confirmValue}</p>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-red-400"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!matches || pending}
                className="flex-1 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                {pending ? "در حال حذف…" : "حذف برای همیشه"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-md border border-border px-4 py-2 text-sm text-text-muted disabled:opacity-50"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}