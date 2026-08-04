"use client";

import { useState, type FormEvent } from "react";
import { uploadChapter } from "@/app/admin/actions/upload-chapter";
import { BatchPageUploader } from "./batch-page-uploader";

interface ComicOption {
  id: string;
  title: string;
}

export function UploadChapterForm({ comics }: { comics: ComicOption[] }) {
  const [comicId, setComicId] = useState(comics[0]?.id ?? "");
  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setStatus("error");
      setError("Select at least one page image");
      return;
    }

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("comicId", comicId);
    formData.set("chapterNumber", chapterNumber);
    formData.set("title", title);
    files.forEach((file) => formData.append("pages", file));

    const result = await uploadChapter(formData);

    if (result.success) {
      setStatus("done");
      setChapterNumber("");
      setTitle("");
      setFiles([]);
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong");
    }
  }

  if (comics.length === 0) {
    return <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">No titles yet — create one first.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">Upload chapter</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="chapter-comic">Title</label>
        <select id="chapter-comic" value={comicId} onChange={(e) => setComicId(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
          {comics.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="chapter-number">Chapter number</label>
          <input id="chapter-number" type="number" step="0.1" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="chapter-title">Title <span className="text-text-muted">(optional)</span></label>
          <input id="chapter-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <BatchPageUploader onFilesChange={setFiles} />

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">Chapter uploaded as draft.</p>}

      <button type="submit" disabled={status === "uploading"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "uploading" ? "Uploading…" : "Upload chapter"}
      </button>
    </form>
  );
}