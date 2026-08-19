"use client";

import { useState, type FormEvent } from "react";
import {
  createCoinPackage,
  updateCoinPackage,
  toggleCoinPackageActive,
  deleteCoinPackage,
  type CoinPackageRow,
} from "@/app/admin/actions/coin-packages";

interface CoinPackageManagerProps {
  initialPackages: CoinPackageRow[];
  tomanPerUsdt: number;
}

interface PackageFormState {
  coins: string;
  bonusCoins: string;
  priceUsdt: string;
  originalPriceUsdt: string;
  badge: string;
  isFeatured: boolean;
  sortOrder: string;
}

const EMPTY_FORM: PackageFormState = {
  coins: "",
  bonusCoins: "0",
  priceUsdt: "",
  originalPriceUsdt: "",
  badge: "",
  isFeatured: false,
  sortOrder: "0",
};

function tomanPreview(priceUsdt: string, tomanPerUsdt: number): string | null {
  const usdt = Number(priceUsdt);
  if (!Number.isFinite(usdt) || usdt <= 0 || !tomanPerUsdt) return null;
  return `≈ ${Math.round(usdt * tomanPerUsdt).toLocaleString("fa-IR")} تومان`;
}

export function CoinPackageManager({ initialPackages, tomanPerUsdt }: CoinPackageManagerProps) {
  const [packages, setPackages] = useState(initialPackages);
  const [form, setForm] = useState<PackageFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PackageFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createCoinPackage({
      coins: Number(form.coins),
      bonusCoins: Number(form.bonusCoins) || 0,
      priceUsdt: Number(form.priceUsdt),
      originalPriceUsdt: form.originalPriceUsdt ? Number(form.originalPriceUsdt) : undefined,
      badge: form.badge.trim() || undefined,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    });

    if (result.success) {
      setStatus("done");
      setForm(EMPTY_FORM);
      window.location.reload();
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در ایجاد پکیج");
    }
  }

  function startEdit(pkg: CoinPackageRow) {
    setEditingId(pkg.id);
    setEditForm({
      coins: String(pkg.coins),
      bonusCoins: String(pkg.bonusCoins),
      priceUsdt: String(pkg.priceUsdt),
      originalPriceUsdt: pkg.originalPriceUsdt != null ? String(pkg.originalPriceUsdt) : "",
      badge: pkg.badge ?? "",
      isFeatured: pkg.isFeatured,
      sortOrder: String(pkg.sortOrder),
    });
  }

  async function handleSaveEdit(packageId: string) {
    setPendingId(packageId);
    setError(null);

    const current = packages.find((p) => p.id === packageId);

    const result = await updateCoinPackage(packageId, {
      coins: Number(editForm.coins),
      bonusCoins: Number(editForm.bonusCoins) || 0,
      priceUsdt: Number(editForm.priceUsdt),
      originalPriceUsdt: editForm.originalPriceUsdt ? Number(editForm.originalPriceUsdt) : undefined,
      badge: editForm.badge.trim() || undefined,
      isActive: current?.isActive ?? true,
      isFeatured: editForm.isFeatured,
      sortOrder: Number(editForm.sortOrder) || 0,
    });

    if (result.success) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === packageId
            ? {
                ...p,
                coins: Number(editForm.coins),
                bonusCoins: Number(editForm.bonusCoins) || 0,
                priceUsdt: Number(editForm.priceUsdt),
                originalPriceUsdt: editForm.originalPriceUsdt ? Number(editForm.originalPriceUsdt) : null,
                badge: editForm.badge.trim() || null,
                isFeatured: editForm.isFeatured,
                sortOrder: Number(editForm.sortOrder) || 0,
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      setError(result.error ?? "خطا در ذخیره‌سازی");
    }
    setPendingId(null);
  }

  async function handleToggleActive(pkg: CoinPackageRow) {
    setPendingId(pkg.id);
    const result = await toggleCoinPackageActive(pkg.id, !pkg.isActive);
    if (result.success) {
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)));
    } else {
      setError(result.error ?? "خطا");
    }
    setPendingId(null);
  }

  async function handleDelete(pkg: CoinPackageRow) {
    if (!confirm(`پکیج «${pkg.coins} سکه» حذف بشه؟ اگر قبلاً استفاده شده باشد، به‌جای حذف غیرفعال می‌شود.`)) return;
    setPendingId(pkg.id);
    const result = await deleteCoinPackage(pkg.id);
    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error ?? "خطا در حذف");
    }
    setPendingId(null);
  }

  const createPreview = tomanPreview(form.priceUsdt, tomanPerUsdt);
  const editPreview = tomanPreview(editForm.priceUsdt, tomanPerUsdt);

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-medium text-text-main">افزودن پکیج سکه جدید</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-coins">تعداد سکه</label>
            <input id="pkg-coins" type="number" min={1} value={form.coins} onChange={(e) => setForm((f) => ({ ...f, coins: e.target.value }))} required placeholder="100" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-bonus">سکه‌های هدیه</label>
            <input id="pkg-bonus" type="number" min={0} value={form.bonusCoins} onChange={(e) => setForm((f) => ({ ...f, bonusCoins: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-price">قیمت (USDT)</label>
            <input id="pkg-price" type="number" step="any" min={0.01} value={form.priceUsdt} onChange={(e) => setForm((f) => ({ ...f, priceUsdt: e.target.value }))} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
            {createPreview && <p className="text-xs text-text-muted">{createPreview}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-original-price">قیمت اصلی قبل تخفیف — USDT (اختیاری)</label>
            <input id="pkg-original-price" type="number" step="any" min={0.01} value={form.originalPriceUsdt} onChange={(e) => setForm((f) => ({ ...f, originalPriceUsdt: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-badge">نشان/برچسب (اختیاری)</label>
            <input id="pkg-badge" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} placeholder="ویژه، تخفیف دار" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-sort">ترتیب نمایش</label>
            <input id="pkg-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-main">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
          نمایش به‌عنوان پیشنهاد ویژه
        </label>

        {status === "error" && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {status === "saving" ? "در حال ذخیره…" : "افزودن پکیج"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">پکیج‌های موجود</h2>
        {error && !editingId && <p className="text-sm text-red-400">{error}</p>}
        <div className="divide-y divide-border rounded-md border border-border">
          {packages.map((pkg) => (
            <div key={pkg.id} className="space-y-3 px-4 py-3">
              {editingId === pkg.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <input type="number" min={1} value={editForm.coins} onChange={(e) => setEditForm((f) => ({ ...f, coins: e.target.value }))} placeholder="تعداد سکه" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" min={0} value={editForm.bonusCoins} onChange={(e) => setEditForm((f) => ({ ...f, bonusCoins: e.target.value }))} placeholder="سکه هدیه" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <div className="space-y-1">
                      <input type="number" step="any" min={0.01} value={editForm.priceUsdt} onChange={(e) => setEditForm((f) => ({ ...f, priceUsdt: e.target.value }))} placeholder="قیمت USDT" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                      {editPreview && <p className="text-[11px] text-text-muted">{editPreview}</p>}
                    </div>
                    <input type="number" step="any" min={0.01} value={editForm.originalPriceUsdt} onChange={(e) => setEditForm((f) => ({ ...f, originalPriceUsdt: e.target.value }))} placeholder="قیمت قبل تخفیف (USDT)" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input value={editForm.badge} onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value }))} placeholder="نشان" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" value={editForm.sortOrder} onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="ترتیب" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-text-muted">
                    <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                    پیشنهاد ویژه
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(pkg.id)} disabled={pendingId === pkg.id} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">ذخیره</button>
                    <button onClick={() => setEditingId(null)} className="rounded-md border border-border px-3 py-1 text-xs text-text-muted">انصراف</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-text-main">
                      {pkg.coins.toLocaleString("fa-IR")} سکه
                      {pkg.bonusCoins > 0 && <span className="text-xs text-primary">(+{pkg.bonusCoins.toLocaleString("fa-IR")} هدیه)</span>}
                      {pkg.badge && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">{pkg.badge}</span>}
                      {pkg.isFeatured && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">ویژه</span>}
                      {!pkg.isActive && <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-text-muted">غیرفعال</span>}
                    </p>
                    <p className="text-xs text-text-muted">
                      {pkg.priceUsdt} USDT
                      {tomanPreview(String(pkg.priceUsdt), tomanPerUsdt) ? ` (${tomanPreview(String(pkg.priceUsdt), tomanPerUsdt)})` : ""}
                      {" · "}ترتیب {pkg.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleActive(pkg)} disabled={pendingId === pkg.id} className="rounded-md border border-border px-2 py-1 text-xs text-text-main disabled:opacity-50">
                      {pkg.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                    </button>
                    <button onClick={() => startEdit(pkg)} className="rounded-md border border-border px-2 py-1 text-xs text-text-main">ویرایش</button>
                    <button onClick={() => handleDelete(pkg)} disabled={pendingId === pkg.id} className="rounded-md border border-red-400 px-2 py-1 text-xs text-red-400 disabled:opacity-50">حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {packages.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز پکیج سکه‌ای ثبت نشده است.</p>}
        </div>
      </div>
    </div>
  );
}