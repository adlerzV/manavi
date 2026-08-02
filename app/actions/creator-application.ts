"use server";

import { prisma } from "@/lib/prisma";

interface CreatorApplicationInput {
  fullName: string;
  contact: string;
  portfolioUrl?: string;
  message: string;
}

export async function submitCreatorApplication(
  input: CreatorApplicationInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.fullName.trim() || !input.contact.trim() || !input.message.trim()) {
    return { success: false, error: "لطفاً همه فیلدهای الزامی را پر کنید" };
  }

  await prisma.creatorApplication.create({
    data: {
      fullName: input.fullName.trim(),
      contact: input.contact.trim(),
      portfolioUrl: input.portfolioUrl?.trim() || null,
      message: input.message.trim(),
    },
  });

  return { success: true };
}