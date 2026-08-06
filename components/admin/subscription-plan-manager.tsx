"use client";

import { useState, type FormEvent } from "react";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  toggleSubscriptionPlanActive,
  deleteSubscriptionPlan,
  type SubscriptionPlanRow,
} from "@/app/admin/actions/subscription-plans";

interface SubscriptionPlanManagerProps {
  initialPlans: SubscriptionPlanRow[];
}

interface PlanFormState {
  label: string;
  months: string;
  priceToman: string;
  isFeatured: boolean;
  sortOrder: string;
  perksText: string;
}

const EMPTY_FORM: PlanFormState = {
  label: "",
  months: "1",
  priceToman: "",
  isFeatured: false,
  sortOrder: "0",
  perksText: "",
};

function parsePerks(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function SubscriptionPlanManager({ initialPlans }: SubscriptionPlanManagerProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PlanFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createSubscriptionPlan({
      label: form.label,
      months: Number(form.months),
      priceToman: Number(form.priceToman),
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
      perks: parsePerks(form.perksText),
    });

    if (result.success) {
      setStatus("done");
      setForm(EMPTY_FORM);
      window.location.reload();
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در ایجاد پلن");
    }
  }

  function startEdit(plan: SubscriptionPlanRow) {
    setEditingId(plan.id);
    setEditForm({
      label: plan.label,
      months: String(plan.months),
      priceToman: String(plan.priceToman),
      isFeatured: plan.isFeatured,
      sortOrder: String(plan.sortOrder),
      perksText: plan.perks.join("\n"),
    });
  }

  async function handleSaveEdit(planId: string) {
    setPendingId(planId);
    setError(null);

    const current = plans.find((p) => p.id === planId);

    const result = await updateSubscriptionPlan(planId, {
      label: editForm.label,
      months: Number(editForm.months),
      priceToman: Number(editForm.priceToman),
      isActive: current?.isActive ?? true,
      isFeatured: editForm.isFeatured,
      sortOrder: Number(editForm.sortOrder) || 0,
      perks: parsePerks(editForm.perksText),
    });

    if (result.success) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId
            ? {
                ...p,
                label: editForm.label.trim(),
                months: Number(editForm.months),
                priceToman: Number(editForm.priceToman),
                isFeatured: editForm.isFeatured,
                sortOrder: Number(editForm.sortOrder) || 0,
                perks: parsePerks(editForm.perksText),
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

  async function handleToggleActive(plan: SubscriptionPlanRow) {
    setPendingId(plan.id);
    const result = await toggleSubscriptionPlanActive(plan.id, !plan.isActive);
    if (result.success) {
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)));
    } else {
      setError(result.error ?? "خطا");
    }
    setPendingId(null);
  }

  async function handleDelete(plan: SubscriptionPlanRow) {
    if (!confirm(`پلن «${plan.label}» حذف بشه؟ اگر قبلاً استفاده شده باشد، به‌جای حذف غیرفعال می‌شود.`)) return;
    setPendingId(plan.id);
    const result = await deleteSubscriptionPlan(plan.id);
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
        <h2 className="text-lg font-medium text-text-main">افزودن پلن اشتراک جدید</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="plan-label">عنوان</label>
            <input id="plan-label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required placeholder="۱ ماهه" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="plan-months">تعداد ماه</label>
            <input id="plan-months" type="number" min={1} value={form.months} onChange={(e) => setForm((f) => ({ ...f, months: e.target.value }))} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="plan-price">قیمت (تومان)</label>
            <input id="plan-price" type="number" min={1} value={form.priceToman} onChange={(e) => setForm((f) => ({ ...f, priceToman: e.target.value }))} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="plan-sort">ترتیب نمایش</label>
            <input id="plan-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="plan-perks">ویژگی‌ها <span className="text-text-muted">(هر خط یک ویژگی، حداکثر ۸ مورد)</span></label>
          <textarea id="plan-perks" value={form.perksText} onChange={(e) => setForm((f) => ({ ...f, perksText: e.target.value }))} rows={4} placeholder={"دسترسی به همه چپترهای قفل‌شده\nحذف تبلیغات\nنشان ویژه در نظرات"} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-main">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
          نمایش به‌عنوان پرطرفدارترین پلن
        </label>

        {status === "error" && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {status === "saving" ? "در حال ذخیره…" : "افزودن پلن"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">پلن‌های موجود</h2>
        {error && !editingId && <p className="text-sm text-red-400">{error}</p>}
        <div className="divide-y divide-border rounded-md border border-border">
          {plans.map((plan) => (
            <div key={plan.id} className="space-y-3 px-4 py-3">
              {editingId === plan.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <input value={editForm.label} onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" min={1} value={editForm.months} onChange={(e) => setEditForm((f) => ({ ...f, months: e.target.value }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" min={1} value={editForm.priceToman} onChange={(e) => setEditForm((f) => ({ ...f, priceToman: e.target.value }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                    <input type="number" value={editForm.sortOrder} onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: e.target.value }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                  </div>
                  <textarea value={editForm.perksText} onChange={(e) => setEditForm((f) => ({ ...f, perksText: e.target.value }))} rows={3} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-main" />
                  <label className="flex items-center gap-2 text-xs text-text-muted">
                    <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                    پرطرفدارترین
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(plan.id)} disabled={pendingId === plan.id} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">ذخیره</button>
                    <button onClick={() => setEditingId(null)} className="rounded-md border border-border px-3 py-1 text-xs text-text-muted">انصراف</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-text-main">
                      {plan.label}
                      {plan.isFeatured && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">پرطرفدار</span>}
                      {!plan.isActive && <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-text-muted">غیرفعال</span>}
                    </p>
                    <p className="text-xs text-text-muted">
                      {plan.months.toLocaleString("fa-IR")} ماهه · {plan.priceToman.toLocaleString("fa-IR")} تومان · ترتیب {plan.sortOrder}
                    </p>
                    {plan.perks.length > 0 && <p className="mt-1 text-xs text-text-muted">{plan.perks.join(" · ")}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleActive(plan)} disabled={pendingId === plan.id} className="rounded-md border border-border px-2 py-1 text-xs text-text-main disabled:opacity-50">
                      {plan.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
                    </button>
                    <button onClick={() => startEdit(plan)} className="rounded-md border border-border px-2 py-1 text-xs text-text-main">ویرایش</button>
                    <button onClick={() => handleDelete(plan)} disabled={pendingId === plan.id} className="rounded-md border border-red-400 px-2 py-1 text-xs text-red-400 disabled:opacity-50">حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {plans.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز پلنی ثبت نشده — فروشگاه برای کاربران به‌صورت «همه‌چیز رایگان است» نمایش داده می‌شود.</p>}
        </div>
      </div>
    </div>
  );
}