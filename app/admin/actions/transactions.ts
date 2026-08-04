"use server";

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
        id: true, type: true, status: true, amount: true, currency: true, createdAt: true,
        payer: { select: { firstName: true, username: true } },
        receiver: { select: { firstName: true, username: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: rows.map((r) => ({ ...r, amount: Number(r.amount), createdAt: r.createdAt.toISOString() })),
    total,
  };
}