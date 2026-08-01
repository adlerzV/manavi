import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Works against AWS S3 or any S3-compatible host (Liara, ArvanCloud) — set
// S3_ENDPOINT to the provider's endpoint, or leave unset for AWS itself.
const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT), // most non-AWS S3-compatible hosts need this
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET = process.env.S3_BUCKET as string;
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL as string; // CDN or public bucket URL prefix

/**
 * Uploads one page image in its original format. Deliberately does NOT
 * convert to WebP/AVIF here — per the performance spec, that conversion
 * happens on the fly via Next.js Image Optimization when the page is
 * served, not baked in at upload time.
 */
export async function uploadPageImage(
  comicId: string,
  chapterNumber: number,
  pageIndex: number,
  file: Buffer,
  contentType: string
): Promise<string> {
  const extension = contentType.split("/")[1] || "bin";
  const key = `comics/${comicId}/chapters/${chapterNumber}/${pageIndex}-${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${PUBLIC_BASE_URL}/${key}`;
}