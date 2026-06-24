const CF_API_BASE = 'https://api.cloudflare.com/client/v4'
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || ''
const CF_STREAM_DOMAIN = process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net'

const cfHeaders = {
  'Authorization': `Bearer ${CF_API_TOKEN}`,
  'Content-Type': 'application/json',
}

export async function createDirectUploadUrl(): Promise<{ uploadUrl: string; videoId: string }> {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        maxDurationSeconds: 3600,
        requireSignedURLs: true,
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

export async function getVideoStatus(videoId: string) {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    { headers: cfHeaders }
  )

  const data = await res.json()
  return data.result
}

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
    playbackUrl: data.result.token,
    expiresAt,
  }
}

export function getEmbedUrl(videoId: string): string {
  return `https://iframe.cloudflarestream.com/${videoId}`
}

export function getHlsUrl(videoId: string): string {
  return `https://${CF_STREAM_DOMAIN}/${videoId}/manifest/video.m3u8`
}

export async function deleteVideo(videoId: string): Promise<void> {
  await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    { method: 'DELETE', headers: cfHeaders }
  )
}

export function getThumbnailUrl(videoId: string): string {
  return `https://${CF_STREAM_DOMAIN}/${videoId}/thumbnails/thumbnail.jpg`
}
