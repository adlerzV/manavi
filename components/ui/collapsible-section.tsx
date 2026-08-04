"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Plus, ChevronUp } from "lucide-react";

const CollapsibleCloseContext = createContext<(() => void) | null>(null);

export function useCollapsibleClose(): (() => void) | null {
  return useContext(CollapsibleCloseContext);
}

interface CollapsibleSectionProps {
  triggerLabel: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ triggerLabel, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const close = () => setOpen(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
      >
        <Plus size={16} />
        {triggerLabel}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button onClick={close} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main">
        <ChevronUp size={14} />
        بستن فرم
      </button>
      <CollapsibleCloseContext.Provider value={close}>{children}</CollapsibleCloseContext.Provider>
    </div>
  );
}