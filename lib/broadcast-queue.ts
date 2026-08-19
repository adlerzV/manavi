import "server-only";
import { randomUUID } from "crypto";
import { redis, isRedisConfigured } from "./redis";
import { broadcastMessage } from "./telegram-bot";

const PENDING_JOBS_KEY = "broadcast:pending-jobs";
const BATCH_SIZE = 150;
const WORKER_TIME_BUDGET_MS = 8000;
const JOB_TTL_SECONDS = 24 * 60 * 60;

interface BroadcastJobRecord {
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  total: number;
  sent: number;
  failed: number;
  status: "PENDING" | "PROCESSING" | "DONE";
  createdAt: number;
}

function jobKey(jobId: string): string {
  return `broadcast:job:${jobId}`;
}
function queueKey(jobId: string): string {
  return `broadcast:queue:${jobId}`;
}

export async function enqueueBroadcastJob(input: {
  telegramIds: bigint[];
  message: string;
  buttonText?: string;
  buttonUrl?: string;
}): Promise<string> {
  const jobId = randomUUID();

  await redis.hset(jobKey(jobId), {
    message: input.message,
    buttonText: input.buttonText ?? "",
    buttonUrl: input.buttonUrl ?? "",
    total: input.telegramIds.length,
    sent: 0,
    failed: 0,
    status: "PENDING",
    createdAt: Date.now(),
  });

  const ids = input.telegramIds.map((id) => id.toString());
  const CHUNK = 1000;
  for (let i = 0; i < ids.length; i += CHUNK) {
    await redis.rpush(queueKey(jobId), ...ids.slice(i, i + CHUNK));
  }

  await redis.sadd(PENDING_JOBS_KEY, jobId);
  return jobId;
}

export async function getBroadcastJobStatus(jobId: string): Promise<BroadcastJobRecord | null> {
  const raw = await redis.hgetall<Record<string, string>>(jobKey(jobId));
  if (!raw || Object.keys(raw).length === 0) return null;

  return {
    message: raw.message,
    buttonText: raw.buttonText || undefined,
    buttonUrl: raw.buttonUrl || undefined,
    total: Number(raw.total),
    sent: Number(raw.sent),
    failed: Number(raw.failed),
    status: raw.status as BroadcastJobRecord["status"],
    createdAt: Number(raw.createdAt),
  };
}

export async function listPendingBroadcastJobIds(): Promise<string[]> {
  if (!isRedisConfigured) return [];
  return (await redis.smembers(PENDING_JOBS_KEY)) as string[];
}

async function markJobDone(jobId: string): Promise<void> {
  await redis.hset(jobKey(jobId), { status: "DONE" });
  await redis.expire(jobKey(jobId), JOB_TTL_SECONDS);
  await redis.srem(PENDING_JOBS_KEY, jobId);
}

async function processJobBatch(jobId: string): Promise<boolean> {
  const rawIds = (await redis.lpop(queueKey(jobId), BATCH_SIZE)) as string[] | null;
  if (!rawIds || rawIds.length === 0) {
    await markJobDone(jobId);
    return false;
  }

  const meta = await getBroadcastJobStatus(jobId);
  if (!meta) {
    await redis.srem(PENDING_JOBS_KEY, jobId);
    return false;
  }

  await redis.hset(jobKey(jobId), { status: "PROCESSING" });

  const result = await broadcastMessage({
    telegramIds: rawIds.map((id) => BigInt(id)),
    text: meta.message,
    buttonText: meta.buttonText,
    buttonUrl: meta.buttonUrl,
  });

  await redis.hincrby(jobKey(jobId), "sent", result.sent);
  await redis.hincrby(jobKey(jobId), "failed", result.failed);

  const remaining = await redis.llen(queueKey(jobId));
  if (remaining === 0) {
    await markJobDone(jobId);
    return false;
  }

  return true;
}

export async function runBroadcastWorkerBatch(jobId: string): Promise<{ done: boolean }> {
  const startedAt = Date.now();
  let hasMore = true;

  while (hasMore && Date.now() - startedAt < WORKER_TIME_BUDGET_MS) {
    hasMore = await processJobBatch(jobId);
  }

  return { done: !hasMore };
}

export async function triggerBroadcastWorker(jobId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_MINI_APP_URL;
  const secret = process.env.INTERNAL_WORKER_SECRET;

  if (!baseUrl || !secret) {
    await runBroadcastWorkerBatch(jobId);
    return;
  }

  await fetch(`${baseUrl}/api/internal/broadcast-worker`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": secret },
    body: JSON.stringify({ jobId }),
  }).catch(() => {});
}