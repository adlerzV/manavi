import "server-only";
export function describeUploadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string })?.code;

  if (code === "ECONNREFUSED" || message.includes("ECONNREFUSED")) {
    return "اتصال به سرویس ذخیره‌سازی (S3) برقرار نشد. آدرس S3_ENDPOINT و در دسترس بودن سرویس را بررسی کنید.";
  }
  if (code === "ENOTFOUND" || message.includes("ENOTFOUND")) {
    return "آدرس سرویس ذخیره‌سازی (S3_ENDPOINT) یافت نشد. مقدار آن را بررسی کنید.";
  }
  if (message.includes("InvalidAccessKeyId") || message.includes("SignatureDoesNotMatch") || message.toLowerCase().includes("credential")) {
    return "احراز هویت سرویس ذخیره‌سازی (S3) ناموفق بود. کلیدهای دسترسی را بررسی کنید.";
  }
  return message;
}