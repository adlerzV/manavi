import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ChapterAccessType } from "@prisma/client";

const WORKER_SECRET = process.env.UPLOAD_WORKER_SECRET;

export async function POST(req: NextRequest) {
  if (!WORKER_SECRET || req.headers.get("x-worker-secret") !== WORKER_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.comicId || !body?.chapterNumber || !Array.isArray(body?.pageKeys) || body.pageKeys.length === 0) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const comic = await prisma.comic.findUnique({
    where: { id: body.comicId },
    select: { license: { select: { status: true } } },
  });
  if (!comic) return NextResponse.json({ error: "comic not found" }, { status: 404 });
  if (comic.license.status === "EXPIRED" || comic.license.status === "TERMINATED") {
    return NextResponse.json({ error: "license inactive" }, { status: 409 });
  }

  const accessType: ChapterAccessType =
    typeof body.accessType === "string" && body.accessType in ChapterAccessType
      ? body.accessType
      : ChapterAccessType.FREE;

  const chapter = await prisma.chapter.create({
    data: {
      comicId: body.comicId,
      chapterNumber: Number(body.chapterNumber),
      title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : null,
      pages: body.pageKeys,
      status: "DRAFT",
      accessType,
    },
  });

  return NextResponse.json({ ok: true, chapterId: chapter.id });
}