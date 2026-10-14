import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
]);

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getR2Client = (): S3Client => {
  const accountId = getRequiredEnv('R2_ACCOUNT_ID');
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
};

const sanitizeSku = (sku: string): string => {
  const normalizedSku = sku.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{0,63}$/.test(normalizedSku)) {
    throw new Error('Invalid product SKU.');
  }
  return normalizedSku;
};

export const getImageExtension = (mimeType: string, originalName: string): string => {
  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Unsupported image format. Use JPEG, PNG, WebP, or AVIF.');
  }

  const extension = path.extname(originalName).toLowerCase();
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
  if (!allowedExtensions.has(extension)) {
    throw new Error('Unsupported image extension. Use JPEG, PNG, WebP, or AVIF.');
  }
  return extension;
};

export const uploadProductImage = async (
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  sku: string,
): Promise<string> => {
  const bucket = getRequiredEnv('R2_BUCKET_NAME');
  const publicUrl = getRequiredEnv('R2_PUBLIC_URL').replace(/\/+$/, '');
  const extension = getImageExtension(mimeType, originalName);
  const safeSku = sanitizeSku(sku);
  const key = `products/${safeSku}/${crypto.randomUUID()}${extension}`;

  await getR2Client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return `${publicUrl}/${key}`;
};
