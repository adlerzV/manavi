const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID as string;
const SANDBOX = process.env.ZARINPAL_SANDBOX === "true";

const API_BASE = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const START_PAY_BASE = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

export class ZarinpalError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = "ZarinpalError";
  }
}

interface RequestPaymentInput {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

interface RequestPaymentResult {
  authority: string;
  paymentUrl: string;
}

export async function requestPayment(input: RequestPaymentInput): Promise<RequestPaymentResult> {
  const res = await fetch(`${API_BASE}/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: input.amountToman,
      callback_url: input.callbackUrl,
      description: input.description,
      metadata: { mobile: input.mobile, email: input.email },
    }),
  });

  const body = await res.json();

  if (!res.ok || body?.data?.code !== 100) {
    throw new ZarinpalError(body?.data?.code ?? 0, body?.errors?.message ?? "Zarinpal request failed");
  }

  return {
    authority: body.data.authority,
    paymentUrl: `${START_PAY_BASE}/${body.data.authority}`,
  };
}

interface VerifyPaymentResult {
  refId: string;
  cardPan: string | null;
}

export async function verifyPayment(authority: string, amountToman: number): Promise<VerifyPaymentResult> {
  const res = await fetch(`${API_BASE}/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      authority,
      amount: amountToman,
    }),
  });

  const body = await res.json();
  const code = body?.data?.code;

  if (code !== 100 && code !== 101) {
    throw new ZarinpalError(code ?? 0, body?.errors?.message ?? "Zarinpal verification failed");
  }

  return {
    refId: String(body.data.ref_id ?? ""),
    cardPan: body.data.card_pan ?? null,
  };
}