import "server-only";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(url && token);

if (!isRedisConfigured) {
  console.warn(
    "[redis] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN تنظیم نشده — کش سشن، کش اشتراک/آنلاک و rate limiting به‌صورت graceful غیرفعال می‌شوند (برنامه بدون Redis هم بالا می‌ماند، فقط با افت جزئی کارایی)."
  );
}

const disconnectedError = () => Promise.reject(new Error("Redis is not configured"));

const redisStub = {
  get: disconnectedError,
  set: disconnectedError,
  del: disconnectedError,
} as unknown as Redis;

export const redis: Redis = isRedisConfigured ? new Redis({ url: url!, token: token! }) : redisStub;