"use client";

import { useState, type FormEvent } from "react";
import { createComic } from "@/app/admin/actions/catalog-actions";

interface LicenseOption {
  id: string;
  publisherName: string;
  territory: string[];
  status: string;
}

export function CreateComicForm({ licenses }: { licenses: LicenseOption[] }) {
  const eligible = licenses.filter((l) => l.status !== "EXPIRED" && l.status !== "TERMINATED");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [licenseId, setLicenseId] = useState(eligible[0]?.id ?? "");
  const [ageRating, setAgeRating] = useState<"NORMAL" | "EIGHTEEN_PLUS" | "NSFW">("NORMAL");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createComic({
      title,
      slug,
      description,
      coverImage,
      bannerImage: bannerImage || undefined,
      licenseId,
      ageRating,
    });

    if (result.success) {
      setStatus("done");
      setTitle("");
      setSlug("");
      setDescription("");
      setCoverImage("");
      setBannerImage("");
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong");
    }
  }

  if (eligible.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        No eligible licenses yet — create a license before adding a title.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">Add title</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="comic-license">
          License
        </label>
        <select
          id="comic-license"
          value={licenseId}
          onChange={(e) => setLicenseId(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
        >
          {eligible.map((l) => (
            <option key={l.id} value={l.id}>
              {l.publisherName} — {l.territory.join("/")} ({l.status})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="comic-title">
            Title
          </label>
          <input
            id="comic-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="comic-slug">
            Slug
          </label>
          <input
            id="comic-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="comic-description">
          Description
        </label>
        <textarea
          id="comic-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="comic-cover">
            Cover image URL
          </label>
          <input
            id="comic-cover"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="comic-banner">
            Banner image URL <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="comic-banner"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="comic-age-rating">
          Age rating
        </label>
        <select
          id="comic-age-rating"
          value={ageRating}
          onChange={(e) => setAgeRating(e.target.value as typeof ageRating)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
        >
          <option value="NORMAL">Normal</option>
          <option value="EIGHTEEN_PLUS">18+</option>
          <option value="NSFW">NSFW</option>
        </select>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">Title created.</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Create title"}
      </button>
    </form>
  );
}