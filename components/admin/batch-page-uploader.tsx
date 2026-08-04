"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";

interface BatchPageUploaderProps {
  onFilesChange: (files: File[]) => void;
}

export function BatchPageUploader({ onFilesChange }: BatchPageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateFiles(next: File[]) {
    setFiles(next);
    onFilesChange(next);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    updateFiles([...files, ...dropped]);
  }

  function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    updateFiles([...files, ...Array.from(e.target.files)]);
    e.target.value = "";
  }

  function handleRemove(index: number) {
    updateFiles(files.filter((_, i) => i !== index));
  }

  function handleItemDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...files];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    updateFiles(next);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center text-sm text-text-muted transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <p>تصاویر صفحات را اینجا رها کنید یا کلیک کنید</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleSelect} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleItemDrop(index)}
              className="group relative aspect-[2/3] cursor-move overflow-hidden rounded-md border border-border bg-surface"
            >
              <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
              <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{index + 1}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute left-1 top-1 rounded bg-red-500/90 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}