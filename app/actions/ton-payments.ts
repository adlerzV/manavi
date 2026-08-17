"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/moderation";
import {
  isTonConfigured,
  getPlatformTonAddress,
  tonToNanotons,
  generateTonComment,
} from "@/lib/ton";
import { findActiveCoinPackage } from "@/lib/coin-packages";
import { getChapterUnlockCoinCost, getCoinPriceTon } from "@/lib/platform-settings";
import { MIN_DONATION_TON, MAX_DONATION_TON, MAX_CUSTOM_COINS } from "@/lib/billing";
import { safeError } from "@/lib/errors";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface TonPaymentRequest {
  transactionId: string;
  toAddress: string;
  amountNanotons: string;
  comment: string;
}

async function createPendingTransaction(input: {
  type: "COIN_PURCHASE" | "DONATION" | "PUBLISHER_PAYOUT";
  amountTon: number;
  payerId: string;
  receiverId?: string;
  message?: string;
  coinPackageId?: string;
  customCoins?: number;
  payoutPublisherId?: string;
}) {
  const transaction = await prisma.transaction.create({
    data: {
      type: input.type,
      status: "PENDING",
      amount: input.amountTon,
      currency: "TON",
      payerId: input.payerId,
      receiverId: input.receiverId,
      message: input.message,
      coinPackageId: input.coinPackageId,
      customCoins: input.customCoins,
      payoutPublisherId: input.payoutPublisherId,
    },
  });

  const comment = generateTonComment(transaction.id);
  await prisma.transaction.update({ where: { id: transaction.id }, data: { tonComment: comment } });

  return { transaction, comment };
}

export async function createTonCoinPayment(packageId: string): Promise<ActionResult<TonPaymentRequest>> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "برای خرید باید وارد شوید" };
  if (user.isBanned) return { success: false, error: "حساب شما مسدود شده است" };
  if (!isTonConfigured()) return { success: false, error: "پرداخت تون هنوز پیکربندی نشده است" };

  const allowed = await checkRateLimit(`ton-coins:${user.id}`, 5);
  if (!allowed) return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" };

  const pack = await findActiveCoinPackage(packageId);
  if (!pack || pack.priceTon == null) {
    return { success: false, error: "این پکیج برای پرداخت با تون در دسترس نیست" };
  }

  const { transaction, comment } = await createPendingTransaction({
    type: "COIN_PURCHASE",
    amountTon: Number(pack.priceTon),
    payerId: user.id,
    coinPackageId: pack.id,
  });

  return {
    success: true,
    data: {
      transactionId: transaction.id,
      toAddress: getPlatformTonAddress(),
      amountNanotons: tonToNanotons(Number(pack.priceTon)).toString(),
      comment,
    },
  };
}

export async function createTonCustomCoinPayment(coins: number): Promise<ActionResult<TonPaymentRequest>> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "برای خرید باید وارد شوید" };
  if (user.isBanned) return { success: false, error: "حساب شما مسدود شده است" };
  if (!isTonConfigured()) return { success: false, error: "پرداخت تون هنوز پیکربندی نشده است" };

  const coinCost = await getChapterUnlockCoinCost();
  if (!Number.isInteger(coins) || coins < coinCost || coins > MAX_CUSTOM_COINS) {
    return {
      success: false,
      error: `تعداد سکه باید حداقل ${coinCost.toLocaleString("fa-IR")} و حداکثر ${MAX_CUSTOM_COINS.toLocaleString("fa-IR")} باشد`,
    };
  }

  const allowed = await checkRateLimit(`ton-coins-custom:${user.id}`, 5);
  if (!allowed) return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" };

  const coinPriceTon = await getCoinPriceTon();
  const amountTon = Math.round(coins * coinPriceTon * 1e9) / 1e9;

  const { transaction, comment } = await createPendingTransaction({
    type: "COIN_PURCHASE",
    amountTon,
    payerId: user.id,
    customCoins: coins,
  });

  return {
    success: true,
    data: {
      transactionId: transaction.id,
      toAddress: getPlatformTonAddress(),
      amountNanotons: tonToNanotons(amountTon).toString(),
      comment,
    },
  };
}

export async function createTonDonationPayment(input: {
  receiverId: string;
  amountTon: number;
  message?: string;
}): Promise<ActionResult<TonPaymentRequest>> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "برای حمایت مالی باید وارد شوید" };
  if (user.isBanned) return { success: false, error: "حساب شما مسدود شده است" };
  if (!isTonConfigured()) return { success: false, error: "پرداخت تون هنوز پیکربندی نشده است" };
  if (input.receiverId === user.id) return { success: false, error: "نمی‌توانید به خودتان حمایت مالی کنید" };
  if (!Number.isFinite(input.amountTon) || input.amountTon < MIN_DONATION_TON || input.amountTon > MAX_DONATION_TON) {
    return { success: false, error: `مبلغ حمایت باید بین ${MIN_DONATION_TON} تا ${MAX_DONATION_TON} TON باشد` };
  }

  const allowed = await checkRateLimit(`ton-donate:${user.id}`, 5);
  if (!allowed) return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" };

  const receiver = await prisma.user.findFirst({
    where: {
      id: input.receiverId,
      OR: [{ staffRoles: { some: {} } }, { chapterStaffRoles: { some: {} } }, { publisherProfile: { isNot: null } }],
    },
    select: { cryptoWalletAddress: true },
  });
  if (!receiver) {
    return { success: false, error: "این کاربر واجد شرایط دریافت حمایت مالی نیست" };
  }
  if (!receiver.cryptoWalletAddress) {
    return { success: false, error: "این کاربر آدرس کیف پول تون ثبت نکرده است" };
  }

  const { transaction, comment } = await createPendingTransaction({
    type: "DONATION",
    amountTon: input.amountTon,
    payerId: user.id,
    receiverId: input.receiverId,
    message: input.message?.trim().slice(0, 300),
  });

  return {
    success: true,
    data: {
      transactionId: transaction.id,
      toAddress: receiver.cryptoWalletAddress,
      amountNanotons: tonToNanotons(input.amountTon).toString(),
      comment,
    },
  };
}

export async function createTonPublisherPayoutPayment(input: {
  publisherId: string;
  amountTon: number;
  periodStart: string;
  periodEnd: string;
}): Promise<ActionResult<TonPaymentRequest>> {
  try {
    const admin = await requireAdmin();

    if (!Number.isFinite(input.amountTon) || input.amountTon <= 0) {
      return { success: false, error: "مبلغ باید مثبت باشد" };
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: input.publisherId },
      select: { id: true, cryptoWalletAddress: true },
    });
    if (!publisher) return { success: false, error: "ناشر یافت نشد" };
    if (!publisher.cryptoWalletAddress) {
      return { success: false, error: "این ناشر آدرس کیف پول تون ثبت نکرده است" };
    }

    const { transaction, comment } = await createPendingTransaction({
      type: "PUBLISHER_PAYOUT",
      amountTon: input.amountTon,
      payerId: admin.id,
      payoutPublisherId: publisher.id,
    });

    await prisma.payoutRequest.create({
      data: {
        publisherId: publisher.id,
        amountTon: input.amountTon,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        status: "PENDING",
        reviewedById: admin.id,
        reviewedAt: new Date(),
        tonTransactionId: transaction.id,
      },
    });

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        toAddress: publisher.cryptoWalletAddress,
        amountNanotons: tonToNanotons(input.amountTon).toString(),
        comment,
      },
    };
  } catch (err) {
    return safeError(err);
  }
}

export interface TonVerifyResult {
  status: "PAID" | "PENDING" | "FAILED";
}

export async function verifyTonPayment(transactionId: string): Promise<ActionResult<TonVerifyResult>> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const allowed = await checkRateLimit(`ton-verify:${user.id}`, 60);
  if (!allowed) return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است" };

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction || transaction.payerId !== user.id) {
    return { success: false, error: "تراکنش یافت نشد" };
  }

  if (transaction.status === "PAID") {
    revalidatePath("/app/shop");
    revalidatePath("/app/profile");
    revalidatePath("/admin/payouts");
    return { success: true, data: { status: "PAID" } };
  }
  if (transaction.status === "FAILED") return { success: true, data: { status: "FAILED" } };
  return { success: true, data: { status: "PENDING" } };
}