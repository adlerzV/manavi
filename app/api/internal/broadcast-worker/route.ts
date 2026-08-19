import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { runBroadcastWorkerBatch, triggerBroadcastWorker } from "@/lib/broadcast-queue";

const INTERNAL_SECRET = process.env.INTERNAL_WORKER_SECRET;

export async function POST(req: NextRequest) {
  if (!INTERNAL_SECRET) {
    return NextResponse.json({ error: "internal worker secret not configured" }, { status: 500 });
  }
  if (req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const jobId = body?.jobId;
  if (typeof jobId !== "string" || !jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const { done } = await runBroadcastWorkerBatch(jobId);

  if (!done) {
    after(() => triggerBroadcastWorker(jobId));
  }

  return NextResponse.json({ ok: true, done });
}