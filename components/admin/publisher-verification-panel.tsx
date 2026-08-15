"use client";

import { useState, useTransition } from "react";
import {
  setPublisherVerified,
  listPublisherStaffMembers,
  setPublisherStaffMemberVerified,
  type PublisherStaffMemberRow,
} from "@/app/admin/actions/verification";

interface PublisherVerificationPanelProps {
  publisherId: string;
  initialIsVerified: boolean;
}

export function PublisherVerificationPanel({ publisherId, initialIsVerified }: PublisherVerificationPanelProps) {
  const [isVerified, setIsVerified] = useState(initialIsVerified);
  const [isPending, startTransition] = useTransition();
  const [showStaff, setShowStaff] = useState(false);
  const [staff, setStaff] = useState<PublisherStaffMemberRow[] | null>(null);
  const [loadingStaff, setLoadingStaff] = useState(false);

  function handleTogglePublisher() {
    const next = !isVerified;
    setIsVerified(next);
    startTransition(async () => {
      const result = await setPublisherVerified(publisherId, next);
      if (!result.success) setIsVerified(!next);
    });
  }

  async function handleToggleStaff() {
    const next = !showStaff;
    setShowStaff(next);
    if (next && staff === null) {
      setLoadingStaff(true);
      const rows = await listPublisherStaffMembers(publisherId);
      setStaff(rows);
      setLoadingStaff(false);
    }
  }

  function handleToggleMember(userId: string, current: boolean) {
    setStaff((prev) => prev?.map((s) => (s.userId === userId ? { ...s, isVerified: !current } : s)) ?? prev);
    startTransition(async () => {
      const result = await setPublisherStaffMemberVerified(publisherId, userId, !current);
      if (!result.success) {
        setStaff((prev) => prev?.map((s) => (s.userId === userId ? { ...s, isVerified: current } : s)) ?? prev);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePublisher}
          disabled={isPending}
          className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
            isVerified ? "bg-primary text-primary-foreground" : "border border-border text-text-muted"
          }`}
        >
          {isVerified ? "✓ تیک آبی فعال" : "اعطای تیک آبی"}
        </button>
        <button onClick={handleToggleStaff} className="text-xs text-text-muted underline decoration-dotted">
          {showStaff ? "بستن اعضای تیم" : "مدیریت تایید اعضای تیم"}
        </button>
      </div>

      {showStaff && (
        <div className="space-y-1 rounded-md border border-border bg-background p-2">
          {loadingStaff && <p className="text-xs text-text-muted">در حال بارگذاری…</p>}
          {staff?.map((member) => (
            <div key={member.userId} className="flex items-center justify-between px-1 py-1">
              <span className="text-xs text-text-main">
                {member.username ? `@${member.username}` : member.firstName}
                <span className="mr-1 text-text-muted">— {member.roles.join("، ")}</span>
              </span>
              <button
                onClick={() => handleToggleMember(member.userId, member.isVerified)}
                disabled={isPending}
                className={`rounded-full px-2 py-0.5 text-[10px] disabled:opacity-50 ${
                  member.isVerified ? "bg-primary/20 text-primary" : "border border-border text-text-muted"
                }`}
              >
                {member.isVerified ? "✓ تاییدشده" : "تایید عضو"}
              </button>
            </div>
          ))}
          {staff?.length === 0 && <p className="px-1 py-1 text-xs text-text-muted">عضوی ثبت نشده.</p>}
        </div>
      )}
    </div>
  );
}