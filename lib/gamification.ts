export const DAILY_CHECKIN_COINS = 5;
export const WEEKLY_STREAK_BONUS_COINS = 25;
export const STREAK_CYCLE_LENGTH = 7;
export const REFERRAL_REWARD_COINS = 10;
export const REFERRAL_WELCOME_BONUS_COINS = 5;

export const CHAPTER_REACTION_EMOJIS = ["❤️", "🔥", "😱", "😢", "👍"] as const;
export type ChapterReactionEmoji = (typeof CHAPTER_REACTION_EMOJIS)[number];

export function isValidReactionEmoji(value: string): value is ChapterReactionEmoji {
  return (CHAPTER_REACTION_EMOJIS as readonly string[]).includes(value);
}