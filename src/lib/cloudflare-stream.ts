const CF_API_BASE = 'https://api.cloudflare.com/client/v4'
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || ''
const CF_STREAM_DOMAIN = process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net'

const cfHeaders = {
  'Authorization': `Bearer ${CF_API_TOKEN}`,
  'Content-Type': 'application/json',
}

/**
 * Create a direct upload URL for Cloudflare Stream.
 * Returns both the upload URL and the video UID for later reference.
 */
export async function createDirectUploadUrl(
  maxDurationSeconds: number = 7200,
  requireSignedUrls: boolean = true
): Promise<{ uploadUrl: string; videoId: string }> {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: requireSignedUrls,
        allowedOrigins: ['*'],
      }),
    }
  )

  const data = await res.json()
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Failed to create upload URL')

  return {
    uploadUrl: data.result.uploadUrl,
    videoId: data.result.uid,
  }
}

/**
 * Upload a video file to Cloudflare Stream via direct upload URL.
 * Used for small files or server-side uploads.
 */
export async function uploadVideo(file: Buffer, filename: string): Promise<{ videoId: string }> {
  const { uploadUrl, videoId } = await createDirectUploadUrl()

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: new Uint8Array(file),
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })

  if (!uploadRes.ok) throw new Error('Failed to upload video to Cloudflare')

  return { videoId }
}

/**
 * Import a video from R2 into Cloudflare Stream.
 * This is the primary workflow: file is in R2, Stream pulls and transcodes it.
 * The video URL must be publicly accessible or use a signed URL.
 */
export async function importFromR2(
  r2Url: string,
  filename: string,
  requireSignedUrls: boolean = true
): Promise<{ videoId: string; status: string }> {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/copy`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        url: r2Url,
        meta: {
          name: filename,
        },
        requireSignedURLs: requireSignedUrls,
      }),
    }
  )

  const data = await res.json()
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Failed to import video from R2')

  return {
    videoId: data.result.uid,
    status: data.result.status?.state || 'processing',
  }
}

/**
 * Get video processing status and metadata.
 */
export async function getVideoStatus(videoId: string) {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    { headers: cfHeaders }
  )

  const data = await res.json()
  return data.result
}

/**
 * Generate a signed playback URL (time-limited token).
 */
export async function getSignedPlaybackUrl(
  videoId: string,
  expiresInMinutes: number = 120
): Promise<{ playbackUrl: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}/token`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        exp: Math.floor(expiresAt.getTime() / 1000),
      }),
    }
  )

  const data = await res.json()
  if (!data.success) throw new Error('Failed to generate signed URL')

  return {
    playbackUrl: `https://${CF_STREAM_DOMAIN}/${videoId}/manifest/video.m3u8?token=${data.result.token}`,
    expiresAt,
  }
}

/**
 * Get the iframe embed URL for a video.
 */
export function getEmbedUrl(videoId: string): string {
  return `https://iframe.cloudflarestream.com/${videoId}`
}

/**
 * Get the thumbnail URL for a video.
 */
export function getThumbnailUrl(videoId: string, params?: { time?: string; height?: number }): string {
  const base = `https://${CF_STREAM_DOMAIN}/${videoId}/thumbnails/thumbnail.jpg`
  if (params) {
    const qs = new URLSearchParams()
    if (params.time) qs.set('time', params.time)
    if (params.height) qs.set('height', String(params.height))
    return `${base}?${qs.toString()}`
  }
  return base
}

/**
 * Delete a video from Stream.
 */
export async function deleteVideo(videoId: string): Promise<void> {
  await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    {
      method: 'DELETE',
      headers: cfHeaders,
    }
  )
}

export { CF_STREAM_DOMAIN }
