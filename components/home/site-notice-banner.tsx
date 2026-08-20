import { getActiveNotice } from "@/lib/notices";

export async function SiteNoticeBanner() {
  const notice = await getActiveNotice();
  if (!notice) return null;

  return (
    <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-xs text-primary">
      {notice.message}
    </div>
  );
}