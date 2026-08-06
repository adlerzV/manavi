import "server-only";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET = process.env.S3_BUCKET as string;
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL;

// حداکثر تعداد آبجکت مجاز در هر درخواست DeleteObjects (محدودیت استاندارد S3 / Backblaze B2)
const MAX_KEYS_PER_DELETE_REQUEST = 1000;

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
      CacheControl: "private, max-age=31536000, immutable",
    })
  );

  return key;
}

export async function uploadChapterThumbnail(
  comicId: string,
  chapterNumber: number,
  file: Buffer,
  contentType: string
): Promise<string> {
  const extension = contentType.split("/")[1] || "bin";
  const key = `comics/${comicId}/chapters/${chapterNumber}/thumbnail-${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return key;
}

export async function uploadComicBanner(comicId: string, file: Buffer, contentType: string): Promise<string> {
  const extension = contentType.split("/")[1] || "bin";
  const key = `comics/${comicId}/banner-${randomUUID()}.${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  if (PUBLIC_BASE_URL) {
    return `${PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
  }
  return getSignedImageUrl(key, 60 * 60 * 24 * 7);
}

export async function getSignedImageUrl(key: string, expiresInSec: number = 21600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3, command, { expiresIn: expiresInSec });
}

export async function getSignedImageUrls(keys: string[], expiresInSec: number = 21600): Promise<string[]> {
  return Promise.all(
    keys.map((key) =>
      key.startsWith("http://") || key.startsWith("https://")
        ? Promise.resolve(key)
        : getSignedImageUrl(key, expiresInSec)
    )
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function deleteObjects(keys: string[]): Promise<void> {
  const realKeys = keys.filter(
    (key) => key && !key.startsWith("http://") && !key.startsWith("https://")
  );
  if (realKeys.length === 0) return;

  for (let i = 0; i < realKeys.length; i += MAX_KEYS_PER_DELETE_REQUEST) {
    const batch = realKeys.slice(i, i + MAX_KEYS_PER_DELETE_REQUEST);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      })
    );
  }
}