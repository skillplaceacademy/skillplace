import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo } from '@/lib/cloudflare-stream'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
    }

    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { videoId } = await uploadVideo(buffer, file.name)

    return NextResponse.json({
      success: true,
      videoId,
      embedUrl: `https://iframe.cloudflarestream.com/${videoId}`,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
