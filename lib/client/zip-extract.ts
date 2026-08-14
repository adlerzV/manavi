"use client";

import { Unzip, UnzipInflate } from "fflate";

const ALLOWED_EXTENSIONS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface ExtractedZipImage {
  name: string;
  contentType: string;
  blob: Blob;
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export async function extractImagesFromZip(file: File): Promise<ExtractedZipImage[]> {
  const results: ExtractedZipImage[] = [];

  await new Promise<void>((resolve, reject) => {
    const unzipper = new Unzip((zipFile) => {
      const extension = extensionOf(zipFile.name);
      const contentType = ALLOWED_EXTENSIONS[extension];
      if (!contentType || zipFile.name.includes("__MACOSX") || zipFile.name.split("/").pop()?.startsWith(".")) {
        return;
      }

      const chunks: Uint8Array[] = [];
      zipFile.ondata = (err, chunk, final) => {
        if (err) {
          reject(err);
          return;
        }
        chunks.push(chunk);
        if (final) {
          const blob = new Blob(chunks as BlobPart[], { type: contentType });
          results.push({ name: zipFile.name, contentType, blob });
        }
      };
      zipFile.start();
    });
    unzipper.register(UnzipInflate);

    const reader = file.stream().getReader();

    function pump(): void {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            unzipper.push(new Uint8Array(0), true);
            resolve();
            return;
          }
          unzipper.push(value, false);
          pump();
        })
        .catch(reject);
    }
    pump();
  });

  results.sort((a, b) => naturalCompare(a.name, b.name));
  return results;
}