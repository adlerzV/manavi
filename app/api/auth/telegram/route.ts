import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData, InvalidInitDataError } from "@/lib/telegram";
import { createSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  let initData: unknown;
  try {
    const body = await req.json();
    initData = body.initData;
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!initData || typeof initData !== "string") {
    return NextResponse.json({ error: "initData is required" }, { status: 400 });
  }

  let validated;
  try {
    validated = validateTelegramInitData(initData);
  } catch (err) {
    if (err instanceof InvalidInitDataError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const { user } = validated;

  const dbUser = await prisma.user.upsert({
    where: { telegramId: BigInt(user.id) },
    update: {
      firstName: user.first_name,
      lastName: user.last_name ?? null,
      username: user.username ?? null,
    },
    create: {
      telegramId: BigInt(user.id),
      firstName: user.first_name,
      lastName: user.last_name ?? null,
      username: user.username ?? null,
    },
  });

  const sessionToken = createSessionToken(dbUser.id);
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.json({
    user: {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      username: dbUser.username,
      role: dbUser.role,
    },
  });
}
