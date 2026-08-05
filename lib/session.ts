import "server-only";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set");
}

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

interface SessionPayload {
  userId: string;
  exp: number; // unix seconds
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET as string).update(payload).digest("hex");
}

/**
 * Minimal signed-cookie session token (payload.signature, both base64url/hex).
 * This is intentionally dependency-free for scaffolding purposes. For a
 * production deploy you may prefer a maintained library (iron-session, jose,
 * NextAuth) — swap this module out without touching the auth route's API.
 */
export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string } | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expectedSignature = sign(payloadB64);
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString()
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
