"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPublisher } from "@/app/admin/actions/catalog-actions";
import { useCollapsibleClose } from "@/components/ui/collapsible-section";

export function CreatePublisherForm() {
  const router = useRouter();
  const close = useCollapsibleClose();
  const [name, setName] = useState("");
  const [legalEntity, setLegalEntity] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createPublisher({ name, legalEntity, contactEmail });

    if (result.success) {
      setStatus("done");
      setName("");
      setLegalEntity("");
      setContactEmail("");
      router.refresh();
      setTimeout(() => close?.(), 1000);
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">Add publisher</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="publisher-name">Name</label>
        <input id="publisher-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="publisher-legal-entity">Legal entity <span className="text-text-muted">(optional)</span></label>
        <input id="publisher-legal-entity" value={legalEntity} onChange={(e) => setLegalEntity(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="publisher-email">Contact email</label>
        <input id="publisher-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">Publisher added.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "Saving…" : "Add publisher"}
      </button>
    </form>
  );
}