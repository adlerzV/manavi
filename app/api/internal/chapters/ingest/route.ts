import { NextRequest, NextResponse } from "next/server";
import { ingestChapter } from "@/lib/chapter-ingest";

const WORKER_SECRET = process.env.UPLOAD_WORKER_SECRET;

export async function POST(req: NextRequest) {
  if (!WORKER_SECRET || req.headers.get("x-worker-secret") !== WORKER_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.comicId || !body?.chapterNumber || !Array.isArray(body?.pageKeys)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const result = await ingestChapter({
    comicId: body.comicId,
    chapterNumber: Number(body.chapterNumber),
    title: body.title ?? null,
    accessType: body.accessType ?? null,
    pageKeys: body.pageKeys,
  });

  if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true, chapterId: result.chapterId });
}