"use client";

import { useCallback, useRef, useState } from "react";
import { requestPageUploadUrls } from "@/app/admin/actions/upload-urls";

const CONCURRENCY = 4;
const MAX_RETRIES_PER_ITEM = 3;
export const MAX_PAGE_SIZE_BYTES = 15 * 1024 * 1024;

export type UploadItemStatus = "pending" | "uploading" | "done" | "error";

export interface UploadItem {
  index: number;
  name: string;
  contentType: string;
  blob: Blob;
  status: UploadItemStatus;
  progress: number;
  key: string | null;
  error: string | null;
}

interface QueueState {
  items: UploadItem[];
  isRunning: boolean;
  isComplete: boolean;
}

async function putWithProgress(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(blob);
  });
}

export function useChapterUploadQueue() {
  const [state, setState] = useState<QueueState>({ items: [], isRunning: false, isComplete: false });
  const uploadIdRef = useRef<string | null>(null);
  const comicIdRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  function updateItem(index: number, patch: Partial<UploadItem>) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.index === index ? { ...item, ...patch } : item)),
    }));
  }

  const reset = useCallback(() => {
    cancelledRef.current = true;
    uploadIdRef.current = null;
    comicIdRef.current = null;
    setState({ items: [], isRunning: false, isComplete: false });
  }, []);

  const start = useCallback(async (comicId: string, files: { name: string; contentType: string; blob: Blob }[]) => {
    cancelledRef.current = false;
    const uploadId = crypto.randomUUID();
    uploadIdRef.current = uploadId;
    comicIdRef.current = comicId;

    const initialItems: UploadItem[] = files.map((file, index) => ({
      index,
      name: file.name,
      contentType: file.contentType,
      blob: file.blob,
      status: "pending",
      progress: 0,
      key: null,
      error: null,
    }));

    setState({ items: initialItems, isRunning: true, isComplete: false });

    const urlResult = await requestPageUploadUrls({
      comicId,
      uploadId,
      files: initialItems.map((item) => ({ index: item.index, contentType: item.contentType })),
    });

    if (!urlResult.success || !urlResult.data) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        items: prev.items.map((item) => ({ ...item, status: "error", error: urlResult.error ?? "خطا در آماده‌سازی آپلود" })),
      }));
      return;
    }

    const urlByIndex = new Map(urlResult.data.items.map((item) => [item.index, item]));

    async function uploadOne(item: UploadItem): Promise<void> {
      const target = urlByIndex.get(item.index);
      if (!target) {
        updateItem(item.index, { status: "error", error: "آدرس آپلود یافت نشد" });
        return;
      }

      let attempt = 0;
      let uploadUrl = target.uploadUrl;

      while (attempt < MAX_RETRIES_PER_ITEM) {
        if (cancelledRef.current) return;
        attempt += 1;
        updateItem(item.index, { status: "uploading", error: null });
        try {
          await putWithProgress(uploadUrl, item.blob, item.contentType, (pct) => updateItem(item.index, { progress: pct }));
          updateItem(item.index, { status: "done", progress: 100, key: target.key });
          return;
        } catch (err) {
          if (attempt >= MAX_RETRIES_PER_ITEM) {
            updateItem(item.index, { status: "error", error: err instanceof Error ? err.message : "خطای آپلود" });
            return;
          }
          const refreshed = await requestPageUploadUrls({
            comicId,
            uploadId,
            files: [{ index: item.index, contentType: item.contentType }],
          });
          if (refreshed.success && refreshed.data?.items[0]) {
            uploadUrl = refreshed.data.items[0].uploadUrl;
          }
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
    }

    const queue = [...initialItems];
    async function worker() {
      while (queue.length > 0) {
        if (cancelledRef.current) return;
        const item = queue.shift();
        if (!item) return;
        await uploadOne(item);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    setState((prev) => ({ ...prev, isRunning: false, isComplete: prev.items.every((i) => i.status === "done") }));
  }, []);

  const retryFailed = useCallback(async () => {
    const comicId = comicIdRef.current;
    const uploadId = uploadIdRef.current;
    if (!comicId || !uploadId) return;

    const failedItems = state.items.filter((item) => item.status === "error");
    if (failedItems.length === 0) return;

    cancelledRef.current = false;
    setState((prev) => ({ ...prev, isRunning: true, isComplete: false }));

    const urlResult = await requestPageUploadUrls({
      comicId,
      uploadId,
      files: failedItems.map((item) => ({ index: item.index, contentType: item.contentType })),
    });

    if (!urlResult.success || !urlResult.data) {
      setState((prev) => ({ ...prev, isRunning: false }));
      return;
    }
    const urlByIndex = new Map(urlResult.data.items.map((item) => [item.index, item]));

    async function uploadOne(item: UploadItem): Promise<void> {
      const target = urlByIndex.get(item.index);
      if (!target) return;
      updateItem(item.index, { status: "uploading", error: null, progress: 0 });
      try {
        await putWithProgress(target.uploadUrl, item.blob, item.contentType, (pct) => updateItem(item.index, { progress: pct }));
        updateItem(item.index, { status: "done", progress: 100, key: target.key });
      } catch (err) {
        updateItem(item.index, { status: "error", error: err instanceof Error ? err.message : "خطای آپلود" });
      }
    }

    const queue = [...failedItems];
    async function worker() {
      while (queue.length > 0) {
        if (cancelledRef.current) return;
        const item = queue.shift();
        if (!item) return;
        await uploadOne(item);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
    setState((prev) => ({ ...prev, isRunning: false, isComplete: prev.items.every((i) => i.status === "done") }));
  }, [state.items]);

  const orderedKeys = useCallback((): string[] | null => {
    if (state.items.length === 0) return null;
    const sorted = [...state.items].sort((a, b) => a.index - b.index);
    if (!sorted.every((item) => item.status === "done" && item.key)) return null;
    return sorted.map((item) => item.key as string);
  }, [state.items]);

  return { items: state.items, isRunning: state.isRunning, isComplete: state.isComplete, start, retryFailed, reset, orderedKeys };
}