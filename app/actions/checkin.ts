"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DAILY_CHECKIN_COINS, WEEKLY_STREAK_BONUS_COINS, STREAK_CYCLE_LENGTH } from "@/lib/gamification";

interface CheckinResult {
  success: boolean;
  error?: string;
  alreadyClaimedToday?: boolean;
  streak?: number;
  coinsAwarded?: number;
  coinsBalance?: number;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isConsecutiveDay(previous: Date, now: Date): boolean {
  const prevMidnight = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((nowMidnight.getTime() - prevMidnight.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays === 1;
}

export async function claimDailyCheckin(): Promise<CheckinResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "برای دریافت جایزه باید وارد شوید" };
  }

  const now = new Date();

  if (user.lastCheckinAt && isSameCalendarDay(user.lastCheckinAt, now)) {
    return {
      success: true,
      alreadyClaimedToday: true,
      streak: user.currentStreak,
      coinsBalance: user.coinsBalance,
    };
  }

  const continuesStreak = user.lastCheckinAt ? isConsecutiveDay(user.lastCheckinAt, now) : false;
  const nextStreak = continuesStreak ? user.currentStreak + 1 : 1;
  const hitBonus = nextStreak % STREAK_CYCLE_LENGTH === 0;
  const coinsAwarded = DAILY_CHECKIN_COINS + (hitBonus ? WEEKLY_STREAK_BONUS_COINS : 0);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      currentStreak: nextStreak,
      longestStreak: Math.max(user.longestStreak, nextStreak),
      lastCheckinAt: now,
      coinsBalance: { increment: coinsAwarded },
    },
  });

  return {
    success: true,
    alreadyClaimedToday: false,
    streak: updated.currentStreak,
    coinsAwarded,
    coinsBalance: updated.coinsBalance,
  };
}