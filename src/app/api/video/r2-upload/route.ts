import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl, getR2Key } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * POST /api/video/r2-upload
 * Generates a presigned R2 URL for direct browser upload.
 * Body: { lessonId: string, filename: string, contentType?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, filename, contentType = 'video/mp4' } = body

    if (!lessonId || !filename) {
      return NextResponse.json(
        { error: 'lessonId and filename are required' },
        { status: 400 }
      )
    }

    // Verify lesson exists
    const { data: lesson, error: lessonErr } = await adminSupabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .maybeSingle()

    if (lessonErr || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Generate unique R2 key
    const key = getR2Key(lessonId, filename)

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await generateUploadUrl(key, contentType, 3600)

    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 3600,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
