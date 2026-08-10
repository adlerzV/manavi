import "server-only";
import { prisma } from "./prisma";
import type { Transaction } from "@prisma/client";
import { REFERRAL_REWARD_COINS } from "./gamification";
import {
  getPlatformTonAddress,
  tonToNanotons,
  fetchAccountTransactions,
  matchIncomingTonPayment,
  TonVerificationError,
} from "./ton";

export type TonSettlementStatus = "PAID" | "PENDING" | "FAILED" | "SKIPPED";

async function resolveTonToAddress(transaction: Transaction): Promise<string | null> {
  if (transaction.type === "DONATION") {
    const receiver = transaction.receiverId
      ? await prisma.user.findUnique({ where: { id: transaction.receiverId }, select: { cryptoWalletAddress: true } })
      : null;
    return receiver?.cryptoWalletAddress ?? null;
  }
  return getPlatformTonAddress();
}

async function grantReferralRewardIfEligible(payerId: string): Promise<void> {
  const payer = await prisma.user.findUnique({
    where: { id: payerId },
    select: { referredById: true, referralRewardGranted: true },
  });
  if (!payer?.referredById || payer.referralRewardGranted) return;

  const claimed = await prisma.user.updateMany({
    where: { id: payerId, referralRewardGranted: false },
    data: { referralRewardGranted: true },
  });
  if (claimed.count === 0) return;

  await prisma.user.update({
    where: { id: payer.referredById },
    data: { coinsBalance: { increment: REFERRAL_REWARD_COINS }, referralCount: { increment: 1 } },
  });
}

async function applySettlementSideEffects(transaction: Transaction): Promise<void> {
  if (transaction.type === "SUBSCRIPTION" && transaction.subscriptionPlanId) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: transaction.subscriptionPlanId } });
    if (plan) {
      const payer = await prisma.user.findUnique({ where: { id: transaction.payerId }, select: { subscriptionEnd: true } });
      const base = payer?.subscriptionEnd && payer.subscriptionEnd > new Date() ? payer.subscriptionEnd : new Date();
      const newEnd = new Date(base);
      newEnd.setMonth(newEnd.getMonth() + plan.months);
      await prisma.user.update({ where: { id: transaction.payerId }, data: { isSubscribed: true, subscriptionEnd: newEnd } });
      await grantReferralRewardIfEligible(transaction.payerId);
    }
    return;
  }

  if (transaction.type === "COIN_PURCHASE" && transaction.coinPackageId) {
    const pack = await prisma.coinPackage.findUnique({ where: { id: transaction.coinPackageId } });
    if (pack) {
      await prisma.user.update({ where: { id: transaction.payerId }, data: { coinsBalance: { increment: pack.coins + pack.bonusCoins } } });
    }
  }
}

async function claimAndSettle(transaction: Transaction, txHash: string): Promise<TonSettlementStatus> {
  const claimed = await prisma.transaction.updateMany({
    where: { id: transaction.id, status: "PENDING" },
    data: { status: "PAID", tonTxHash: txHash },
  });

  if (claimed.count === 0) {
    return "PAID";
  }

  await applySettlementSideEffects(transaction);
  return "PAID";
}

export async function settlePendingTonTransaction(transaction: Transaction): Promise<TonSettlementStatus> {
  if (transaction.status === "PAID") return "PAID";
  if (transaction.status === "FAILED") return "FAILED";
  if (!transaction.tonComment) return "SKIPPED";

  const toAddress = await resolveTonToAddress(transaction);
  if (!toAddress) return "SKIPPED";

  let transactions;
  try {
    transactions = await fetchAccountTransactions(toAddress);
  } catch (err) {
    if (err instanceof TonVerificationError) return "PENDING";
    throw err;
  }

  const found = matchIncomingTonPayment(transactions, {
    comment: transaction.tonComment,
    minAmountNanotons: tonToNanotons(Number(transaction.amount)),
    afterUnixTime: Math.floor(transaction.createdAt.getTime() / 1000) - 60,
  });

  if (!found) return "PENDING";
  return claimAndSettle(transaction, found.hash);
}

export async function settlePendingTonTransactions(
  transactions: Transaction[]
): Promise<{ settled: number; checked: number }> {
  const byAddress = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    if (transaction.status !== "PENDING" || !transaction.tonComment) continue;
    const toAddress = await resolveTonToAddress(transaction);
    if (!toAddress) continue;
    const bucket = byAddress.get(toAddress) ?? [];
    bucket.push(transaction);
    byAddress.set(toAddress, bucket);
  }

  let settled = 0;
  let checked = 0;

  for (const [toAddress, group] of byAddress) {
    let chainTransactions;
    try {
      chainTransactions = await fetchAccountTransactions(toAddress);
    } catch {
      continue;
    }

    for (const transaction of group) {
      checked += 1;
      const found = matchIncomingTonPayment(chainTransactions, {
        comment: transaction.tonComment as string,
        minAmountNanotons: tonToNanotons(Number(transaction.amount)),
        afterUnixTime: Math.floor(transaction.createdAt.getTime() / 1000) - 60,
      });
      if (!found) continue;
      const status = await claimAndSettle(transaction, found.hash);
      if (status === "PAID") settled += 1;
    }
  }

  return { settled, checked };
}