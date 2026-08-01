import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

// Reject initData older than this — prevents replaying a captured payload.
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ValidatedInitData {
  user: TelegramUser;
  authDate: Date;
  queryId?: string;
}

export class InvalidInitDataError extends Error {
  constructor(reason: string) {
    super(`Invalid Telegram initData: ${reason}`);
    this.name = "InvalidInitDataError";
  }
}

/**
 * Validates the initData string sent by the Telegram Mini App client.
 * Algorithm per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 *   secret_key = HMAC_SHA256(key = "WebAppData", data = bot_token)
 *   hash       = HEX( HMAC_SHA256(key = secret_key, data = data_check_string) )
 *
 * Throws InvalidInitDataError on any failure — callers should catch it and
 * respond 401, never fall back to trusting the payload.
 */
export function validateTelegramInitData(initData: string): ValidatedInitData {
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");
  if (!hash) {
    throw new InvalidInitDataError("missing hash field");
  }
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN as string)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const hashBuffer = Buffer.from(hash, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");
  const validSignature =
    hashBuffer.length === computedBuffer.length &&
    crypto.timingSafeEqual(hashBuffer, computedBuffer);

  if (!validSignature) {
    throw new InvalidInitDataError("hash mismatch — data was not signed by this bot");
  }

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) {
    throw new InvalidInitDataError("missing auth_date field");
  }
  const authDate = new Date(Number(authDateRaw) * 1000);
  const ageSeconds = (Date.now() - authDate.getTime()) / 1000;

  if (ageSeconds > MAX_AUTH_AGE_SECONDS) {
    throw new InvalidInitDataError("auth_date is too old — possible replay");
  }
  if (ageSeconds < -60) {
    // small allowance for clock skew between client and server
    throw new InvalidInitDataError("auth_date is in the future");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new InvalidInitDataError("missing user field");
  }

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    throw new InvalidInitDataError("user field is not valid JSON");
  }

  if (!user.id) {
    throw new InvalidInitDataError("user.id missing");
  }

  return {
    user,
    authDate,
    queryId: params.get("query_id") ?? undefined,
  };
}
