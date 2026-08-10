import "server-only";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export function safeError<T = undefined>(
  err: unknown,
  publicMessage = "خطایی رخ داد، دوباره تلاش کنید"
): ActionResult<T> {
  console.error(err);
  return { success: false, error: publicMessage };
}