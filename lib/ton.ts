import "server-only";

const TONAPI_BASE = process.env.TONAPI_BASE_URL || "https://tonapi.io";
const TONAPI_KEY = process.env.TONAPI_KEY;
const PLATFORM_TON_ADDRESS = process.env.TON_PLATFORM_WALLET_ADDRESS;

export function isTonConfigured(): boolean {
  return Boolean(PLATFORM_TON_ADDRESS);
}

export function getPlatformTonAddress(): string {
  if (!PLATFORM_TON_ADDRESS) {
    throw new Error("TON_PLATFORM_WALLET_ADDRESS تنظیم نشده است");
  }
  return PLATFORM_TON_ADDRESS;
}

export function tonToNanotons(amountTon: number): bigint {
  return BigInt(Math.round(amountTon * 1_000_000_000));
}

export function generateTonComment(transactionId: string): string {
  return `manavi-${transactionId}`;
}

interface TonApiTransaction {
  hash: string;
  utime: number;
  in_msg?: {
    source?: { address: string };
    value: number;
    decoded_body?: { text?: string };
  };
}

interface TonApiTransactionsResponse {
  transactions: TonApiTransaction[];
}

export class TonVerificationError extends Error {}

export async function findIncomingTonPayment(input: {
  toAddress: string;
  comment: string;
  minAmountNanotons: bigint;
  afterUnixTime: number;
}): Promise<{ hash: string; fromAddress: string | null } | null> {
  const url = `${TONAPI_BASE}/v2/blockchain/accounts/${input.toAddress}/transactions?limit=50`;

  const res = await fetch(url, {
    headers: TONAPI_KEY ? { Authorization: `Bearer ${TONAPI_KEY}` } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new TonVerificationError(`TonAPI request failed (${res.status})`);
  }

  const body = (await res.json()) as TonApiTransactionsResponse;

  const match = body.transactions?.find((tx) => {
    if (tx.utime < input.afterUnixTime) return false;
    const text = tx.in_msg?.decoded_body?.text;
    if (!text || !text.includes(input.comment)) return false;
    const value = BigInt(tx.in_msg?.value ?? 0);
    return value >= input.minAmountNanotons;
  });

  if (!match) return null;
  return { hash: match.hash, fromAddress: match.in_msg?.source?.address ?? null };
}