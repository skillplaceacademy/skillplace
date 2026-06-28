import { NextRequest, NextResponse } from 'next/server'
import { getR2Url } from '@/lib/cloudflare-r2'
import { importFromR2 } from '@/lib/cloudflare-stream'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * POST /api/video/r2-to-stream
 * Triggers Cloudflare Stream to import a video from R2.
 * Body: { lessonId: string, r2Key: string, filename: string }
 *
 * Workflow:
 * 1. Client uploads file to R2 via presigned URL
 * 2. Client calls this endpoint to trigger Stream import
 * 3. Stream pulls from R2 URL and transcodes
 * 4. We store the video_id and update status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, r2Key, filename } = body

    if (!lessonId || !r2Key || !filename) {
      return NextResponse.json(
        { error: 'lessonId, r2Key, and filename are required' },
        { status: 400 }
      )
    }

    // Build the R2 URL that Stream will pull from
    const r2Url = getR2Url(r2Key)

    // Trigger Stream import
    const { videoId, status } = await importFromR2(r2Url, filename, true)

    // Update lesson record with Stream video ID and status
    const { error: updateErr } = await adminSupabase
      .from('lessons')
      .update({
        video_id: videoId,
        r2_source_key: r2Key,
        r2_original_filename: filename,
        stream_status: status === 'processing' ? 'processing' : 'ready',
        video_url: null, // Clear legacy URL since we now use Stream
      })
      .eq('id', lessonId)

    if (updateErr) {
      console.error('Failed to update lesson with video_id:', updateErr)
    }

    return NextResponse.json({
      success: true,
      videoId,
      status: status,
      embedUrl: `https://iframe.cloudflarestream.com/${videoId}`,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
