import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { type CertificateType, type CertificateTheme } from '@/lib/certificate-types'
import { generateCertificateHTML } from '@/lib/certificate-templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*, profiles(full_name, email), courses(title, duration_hours)')
    .eq('id', id)
    .single()

  if (error || !cert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  const profiles = cert.profiles as Record<string, unknown> | null
  const courses = cert.courses as Record<string, unknown> | null

  const studentName = (profiles?.full_name as string) || 'Student'
  const courseName = (courses?.title as string) || 'Course'
  const certNumber = cert.certificate_number as string
  const issuedDate = new Date(cert.issued_at as string).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const duration = (courses?.duration_hours as number)?.toString() || 'N/A'
  const typeId = ((cert.certificate_type as string) || 'course_completion') as CertificateType
  const themeId = ((cert.theme as string) || 'classic') as CertificateTheme
  const organizationName = (cert.organization_name as string) || ''
  const customMessage = (cert.custom_message as string) || ''

  const html = generateCertificateHTML({
    studentName,
    courseName,
    certNumber,
    issuedDate,
    duration,
    typeId,
    themeId,
    organizationName,
    customMessage,
  })

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
