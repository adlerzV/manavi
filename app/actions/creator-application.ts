// app/actions/creator-application.ts
"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/moderation";

interface CreatorApplicationInput {
  fullName: string;
  contact: string;
  portfolioUrl?: string;
  message: string;
  website?: string;
}

export async function submitCreatorApplication(
  input: CreatorApplicationInput
): Promise<{ success: boolean; error?: string }> {
  if (input.website) {
    return { success: true };
  }

  if (!input.fullName.trim() || !input.contact.trim() || !input.message.trim()) {
    return { success: false, error: "لطفاً همه فیلدهای الزامی را پر کنید" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(`creator-app:${ip}`, 3);
  if (!allowed) {
    return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" };
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