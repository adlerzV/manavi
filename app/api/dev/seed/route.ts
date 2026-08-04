import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_TELEGRAM_ID = 1000000001n;
const USER_TELEGRAM_ID = 1000000002n;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const admin = await prisma.user.upsert({
    where: { telegramId: ADMIN_TELEGRAM_ID },
    update: {},
    create: {
      telegramId: ADMIN_TELEGRAM_ID,
      firstName: "Admin",
      username: "dev_admin",
      role: "ADMIN",
    },
  });

  const reader = await prisma.user.upsert({
    where: { telegramId: USER_TELEGRAM_ID },
    update: {},
    create: {
      telegramId: USER_TELEGRAM_ID,
      firstName: "Reader",
      username: "dev_reader",
      role: "USER",
      coinsBalance: 100,
    },
  });

  let publisher = await prisma.publisher.findFirst({ where: { name: "Test Publisher" } });
  if (!publisher) {
    publisher = await prisma.publisher.create({
      data: { name: "Test Publisher", contactEmail: "test@example.com" },
    });
  }

  let license = await prisma.license.findFirst({ where: { publisherId: publisher.id } });
  if (!license) {
    license = await prisma.license.create({
      data: {
        publisherId: publisher.id,
        territory: ["GLOBAL"],
        royaltyPercentage: 50,
        status: "ACTIVE",
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // دیروز
      },
    });
  }

  let comic = await prisma.comic.findUnique({ where: { slug: "test-manhwa" } });
  if (!comic) {
    comic = await prisma.comic.create({
      data: {
        title: "مانهوای تستی",
        slug: "test-manhwa",
        description: "این یک عنوان تستی برای بررسی صفحات پروژه است.",
        coverImage: "https://picsum.photos/seed/manavi-cover/400/600",
        bannerImage: "https://picsum.photos/seed/manavi-banner/1200/400",
        ageRating: "NORMAL",
        licenseId: license.id,
      },
    });
  }

  const existingChapter = await prisma.chapter.findFirst({ where: { comicId: comic.id, chapterNumber: 1 } });
  if (!existingChapter) {
    await prisma.chapter.create({
      data: {
        comicId: comic.id,
        chapterNumber: 1,
        pages: [
          "https://picsum.photos/seed/page1/800/1200",
          "https://picsum.photos/seed/page2/800/1200",
          "https://picsum.photos/seed/page3/800/1200",
        ],
        publishedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    admin: { id: admin.id, telegramId: admin.telegramId.toString() },
    reader: { id: reader.id, telegramId: reader.telegramId.toString() },
    comicSlug: comic.slug,
  });
}