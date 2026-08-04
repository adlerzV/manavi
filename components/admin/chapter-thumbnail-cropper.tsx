"use client";

import { useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { saveChapterThumbnail } from "@/app/admin/actions/chapter-thumbnail";

const CROP_SIZE = 240;

export function ChapterThumbnailCropper({ chapterId }: { chapterId: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const imgRef = useRef<HTMLImageElement>(null);

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setStatus("idle");
  }

  function handleMouseDown(e: MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  async function handleSave() {
    if (!imgRef.current) return;
    setStatus("saving");

    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    ctx.save();
    ctx.translate(CROP_SIZE / 2 + offset.x, CROP_SIZE / 2 + offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setStatus("error");
          return;
        }
        const formData = new FormData();
        formData.set("chapterId", chapterId);
        formData.set("thumbnail", blob, "thumbnail.jpg");
        const result = await saveChapterThumbnail(formData);
        setStatus(result.success ? "done" : "error");
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <input type="file" accept="image/*" onChange={handleSelect} className="text-xs text-text-muted" />

      {imageUrl && (
        <>
          <div
            className="relative mx-auto overflow-hidden rounded-md border border-border bg-black"
            style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                userSelect: "none",
              }}
            />
          </div>

          <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full" />

          <button onClick={handleSave} disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {status === "saving" ? "در حال ذخیره…" : "ذخیره ثامبنیل"}
          </button>
          {status === "error" && <p className="text-sm text-red-400">خطا در ذخیره‌سازی</p>}
          {status === "done" && <p className="text-sm text-primary">ثامبنیل ذخیره شد.</p>}
        </>
      )}
    </div>
  );
}