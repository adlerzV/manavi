import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/session";

const ADMIN_TELEGRAM_ID = 1000000001n;
const USER_TELEGRAM_ID = 1000000002n;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const as = url.searchParams.get("as");
  const redirectTo = url.searchParams.get("redirect") ?? "/";

  const telegramId = as === "admin" ? ADMIN_TELEGRAM_ID : USER_TELEGRAM_ID;
  const user = await prisma.user.findUnique({ where: { telegramId } });

  if (!user) {
    return NextResponse.json(
      { error: "کاربر تستی پیدا نشد — اول /api/dev/seed رو صدا بزن" },
      { status: 404 }
    );
  }

  const token = createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.redirect(new URL(redirectTo, req.url));
}