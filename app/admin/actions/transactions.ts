"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { TransactionType, TransactionStatus } from "@prisma/client";

export interface TransactionRow {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  createdAt: string;
  payer: { firstName: string; username: string | null };
  receiver: { firstName: string; username: string | null } | null;
}

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function searchTransactions(query: {
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  pageSize?: number;
}): Promise<{ transactions: TransactionRow[]; total: number }> {
  await requireAdmin();

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 25;
  const where = { type: query.type, status: query.status };

  const [rows, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
        payer: { select: { firstName: true, username: true } },
        receiver: { select: { firstName: true, username: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: rows.map((r) => ({
      ...r,
      amount: Number(r.amount),
      createdAt: r.createdAt.toISOString(),
    })),
    total,
  };
}

export async function cleanupOldFailedTransactions(
  days: number
): Promise<ActionResult<{ deleted: number }>> {
  try {
    await requireAdmin();
    if (!Number.isFinite(days) || days <= 0) {
      return { success: false, error: "تعداد روز باید عددی مثبت باشد" };
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await prisma.transaction.deleteMany({
      where: { status: "FAILED", createdAt: { lt: cutoff } },
    });

    revalidatePath("/admin/transactions");
    return { success: true, data: { deleted: result.count } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}