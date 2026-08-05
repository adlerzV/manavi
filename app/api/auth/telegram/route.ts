import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateTelegramInitData, InvalidInitDataError } from "@/lib/telegram";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";
import { generateReferralCode } from "@/lib/referral";
import { REFERRAL_REWARD_COINS, REFERRAL_WELCOME_BONUS_COINS } from "@/lib/gamification";

async function createUserWithReferral(input: {
  telegramId: bigint;
  firstName: string;
  lastName: string | null;
  username: string | null;
  referrerId: string | null;
}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const referralCode = generateReferralCode();
    try {
      return await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            telegramId: input.telegramId,
            firstName: input.firstName,
            lastName: input.lastName,
            username: input.username,
            referralCode,
            referredById: input.referrerId,
            coinsBalance: input.referrerId ? REFERRAL_WELCOME_BONUS_COINS : 0,
          },
        });

        if (input.referrerId) {
          await tx.user.update({
            where: { id: input.referrerId },
            data: {
              coinsBalance: { increment: REFERRAL_REWARD_COINS },
              referralCount: { increment: 1 },
            },
          });
        }

        return created;
      });
    } catch (err) {
      const isUniqueViolation = err instanceof Error && err.message.includes("Unique constraint");
      if (!isUniqueViolation || attempt === 4) throw err;
    }
  }
  throw new Error("Failed to allocate a unique referral code");
}

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

  const { user, startParam } = validated;

  const existing = await prisma.user.findUnique({ where: { telegramId: BigInt(user.id) } });

  let dbUser;
  if (existing) {
    dbUser = await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: user.first_name,
        lastName: user.last_name ?? null,
        username: user.username ?? null,
      },
    });
  } else {
    const referrer = startParam
      ? await prisma.user.findUnique({ where: { referralCode: startParam } })
      : null;

    dbUser = await createUserWithReferral({
      telegramId: BigInt(user.id),
      firstName: user.first_name,
      lastName: user.last_name ?? null,
      username: user.username ?? null,
      referrerId: referrer?.id ?? null,
    });
  }

  const sessionToken = createSessionToken(dbUser.id);
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, sessionCookieOptions());

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