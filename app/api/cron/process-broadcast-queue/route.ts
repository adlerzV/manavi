import { NextRequest, NextResponse } from "next/server";
import { listPendingBroadcastJobIds, triggerBroadcastWorker } from "@/lib/broadcast-queue";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !CRON_SECRET) {
    return NextResponse.json({ error: "cron secret not configured" }, { status: 500 });
  }
  if (CRON_SECRET) {
    const provided = req.headers.get("authorization");
    if (provided !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const jobIds = await listPendingBroadcastJobIds();
  await Promise.all(jobIds.map((jobId) => triggerBroadcastWorker(jobId)));

  return NextResponse.json({ ok: true, resumed: jobIds.length });
}