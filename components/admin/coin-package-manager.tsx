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
}

interface PackageFormState {
  coins: string;
  bonusCoins: string;
  priceToman: string;
  priceTon: string;
  originalPriceToman: string;
  badge: string;
  isFeatured: boolean;
  sortOrder: string;
}

const EMPTY_FORM: PackageFormState = {
  coins: "",
  bonusCoins: "0",
  priceToman: "",
  priceTon: "",
  originalPriceToman: "",
  badge: "",
  isFeatured: false,
  sortOrder: "0",
};

export function CoinPackageManager({ initialPackages }: CoinPackageManagerProps) {
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
      priceToman: Number(form.priceToman),
      priceTon: form.priceTon ? Number(form.priceTon) : undefined,
      originalPriceToman: form.originalPriceToman ? Number(form.originalPriceToman) : undefined,
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
      priceToman: String(pkg.priceToman),
      priceTon: pkg.priceTon != null ? String(pkg.priceTon) : "",
      originalPriceToman: pkg.originalPriceToman != null ? String(pkg.originalPriceToman) : "",
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
      priceToman: Number(editForm.priceToman),
      priceTon: editForm.priceTon ? Number(editForm.priceTon) : undefined,
      originalPriceToman: editForm.originalPriceToman ? Number(editForm.originalPriceToman) : undefined,
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
                priceToman: Number(editForm.priceToman),
                priceTon: editForm.priceTon ? Number(editForm.priceTon) : null,
                originalPriceToman: editForm.originalPriceToman ? Number(editForm.originalPriceToman) : null,
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
            <label className="text-sm text-text-muted" htmlFor="pkg-price">قیمت (تومان)</label>
            <input id="pkg-price" type="number" min={1} value={form.priceToman} onChange={(e) => setForm((f) => ({ ...f, priceToman: e.target.value }))} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-price-ton">قیمت TON (اختیاری)</label>
            <input id="pkg-price-ton" type="number" step="any" min={0} value={form.priceTon} onChange={(e) => setForm((f) => ({ ...f, priceTon: e.target.value }))} placeholder="قیمت TON" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="pkg-original-price">قیمت اصلی قبل تخفیف (اختیاری)</label>
            <input id="pkg-original-price" type="number" min={1} value={form.originalPriceToman} onChange={(e) => setForm((f) => ({ ...f, originalPriceToman: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
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
                    <input type="number" min={1} value={editForm.priceToman} onChange={(e) => setEditForm((f) => ({ ...f, priceToman: e.target.value }))} placeholder="قیمت تومان" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" step="any" min={0} value={editForm.priceTon} onChange={(e) => setEditForm((f) => ({ ...f, priceTon: e.target.value }))} placeholder="قیمت TON" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" min={1} value={editForm.originalPriceToman} onChange={(e) => setEditForm((f) => ({ ...f, originalPriceToman: e.target.value }))} placeholder="قیمت قبل تخفیف" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
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
                      {pkg.priceToman.toLocaleString("fa-IR")} تومان{pkg.priceTon != null ? ` · ${pkg.priceTon} TON` : ""} · ترتیب {pkg.sortOrder}
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