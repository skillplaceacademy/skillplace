import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'skillplace-videos'
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || ''

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export function getR2Key(lessonId: string, filename: string): string {
  const ext = filename.split('.').pop() || 'mp4'
  return `lessons/${lessonId}/${Date.now()}.${ext}`
}

export function getR2Url(key: string): string {
  if (R2_PUBLIC_DOMAIN) {
    return `https://${R2_PUBLIC_DOMAIN}/${key}`
  }
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`
}

export async function ensureBucket(): Promise<void> {
  try {
    await r2Client.send(new HeadBucketCommand({ Bucket: R2_BUCKET_NAME }))
  } catch {
    try {
      await r2Client.send(new CreateBucketCommand({ Bucket: R2_BUCKET_NAME }))
    } catch (err) {
      console.error('Failed to create R2 bucket:', err)
    }
  }
}

export async function generateUploadUrl(
  key: string,
  contentType: string = 'video/mp4',
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(r2Client, command, { expiresIn })
}

export async function deleteVideo(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  )
}

export { R2_BUCKET_NAME, R2_PUBLIC_DOMAIN }
