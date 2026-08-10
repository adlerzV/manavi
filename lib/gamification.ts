export const REFERRAL_REWARD_COINS = 10;

export const CHAPTER_REACTION_EMOJIS = ["❤️", "🔥", "😱", "😢", "👍"] as const;
export type ChapterReactionEmoji = (typeof CHAPTER_REACTION_EMOJIS)[number];

export function isValidReactionEmoji(value: string): value is ChapterReactionEmoji {
  return (CHAPTER_REACTION_EMOJIS as readonly string[]).includes(value);
}