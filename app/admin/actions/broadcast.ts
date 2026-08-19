"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { isRedisConfigured } from "@/lib/redis";
import { broadcastMessage } from "@/lib/telegram-bot";
import { enqueueBroadcastJob, getBroadcastJobStatus, triggerBroadcastWorker } from "@/lib/broadcast-queue";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface BroadcastJobMeta {
  total: number;
  sent: number;
  failed: number;
  status: "PENDING" | "PROCESSING" | "DONE";
}

export interface BroadcastSendResult {
  mode: "sync" | "queued";
  sent?: number;
  failed?: number;
  jobId?: string;
  total?: number;
}

const MAX_MESSAGE_LENGTH = 3500;
const SYNC_SEND_THRESHOLD = 300;

export async function sendBroadcast(input: {
  message: string;
  buttonText?: string;
  buttonUrl?: string;
}): Promise<ActionResult<BroadcastSendResult>> {
  try {
    await requireAdmin();

    const message = input.message.trim();
    if (!message) return { success: false, error: "متن پیام خالی است" };
    if (message.length > MAX_MESSAGE_LENGTH) {
      return { success: false, error: `متن پیام نباید بیش از ${MAX_MESSAGE_LENGTH} کاراکتر باشد` };
    }

    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: { telegramId: true },
    });

    if (users.length === 0) {
      return { success: false, error: "کاربری برای ارسال یافت نشد" };
    }

    const buttonUrl = input.buttonUrl?.trim();
    const resolvedButtonUrl = buttonUrl
      ? buttonUrl.startsWith("http")
        ? buttonUrl
        : `${process.env.NEXT_PUBLIC_MINI_APP_URL}${buttonUrl.startsWith("/") ? "" : "/"}${buttonUrl}`
      : undefined;

    const telegramIds = users.map((u) => u.telegramId);
    const buttonText = input.buttonText?.trim() || undefined;

    if (!isRedisConfigured || telegramIds.length <= SYNC_SEND_THRESHOLD) {
      const result = await broadcastMessage({ telegramIds, text: message, buttonText, buttonUrl: resolvedButtonUrl });
      return { success: true, data: { mode: "sync", sent: result.sent, failed: result.failed } };
    }

    const jobId = await enqueueBroadcastJob({ telegramIds, message, buttonText, buttonUrl: resolvedButtonUrl });
    after(() => triggerBroadcastWorker(jobId));

    return { success: true, data: { mode: "queued", jobId, total: telegramIds.length } };
  } catch (err) {
    return safeError(err);
  }
}

export async function getBroadcastJobStatusAction(jobId: string): Promise<ActionResult<BroadcastJobMeta>> {
  try {
    await requireAdmin();
    const status = await getBroadcastJobStatus(jobId);
    if (!status) return { success: false, error: "این عملیات یافت نشد یا منقضی شده" };
    return {
      success: true,
      data: { total: status.total, sent: status.sent, failed: status.failed, status: status.status },
    };
  } catch (err) {
    return safeError(err);
  }
}