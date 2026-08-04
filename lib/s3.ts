import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET = process.env.S3_BUCKET as string;

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

export async function getSignedImageUrl(key: string, expiresInSec: number = 21600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

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