import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, phone, location, program_type, course_id, start_date, notes } = body

    if (!full_name || !email || !phone || !program_type || !course_id) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, phone, program_type, course_id' },
        { status: 400 }
      )
    }

    // Try to get authenticated user from session
    let authUserId: string | null = null
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        authUserId = user.id
      }
    } catch {
      // Not authenticated, proceed without auth user
    }

    // Find or create profile by email
    let profileId: string | null = null

    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      profileId = existingProfile.id
      // Update profile with program_type
      await adminSupabase
        .from('profiles')
        .update({
          full_name,
          phone,
          program_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
    } else {
      // Create new profile (without auth - will need to register separately)
      const { data: newProfile, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          email,
          full_name,
          phone,
          role: 'student',
          program_type,
          is_active: true,
        })
        .select('id')
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
      profileId = newProfile.id
    }

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id: profileId,
        course_id,
        program_type,
        status: 'pending',
        notes: notes || null,
      })
      .select('id')
      .single()

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError)
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.id,
      message: 'Enrollment application submitted successfully',
    })
  } catch (error: unknown) {
    console.error('Enrollment API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
