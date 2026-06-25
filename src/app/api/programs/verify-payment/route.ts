import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      programId,
      studentName,
      email,
      phone,
      location,
      notes,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !programId) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Verify payment status with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
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
      await adminSupabase
        .from('profiles')
        .update({
          full_name: studentName,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
    } else {
      const { data: newProfile, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          email,
          full_name: studentName,
          phone,
          role: 'student',
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
        course_id: programId,
        program_type: payment.notes?.program_type || null,
        status: 'active',
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
      enrollmentId: enrollment.id,
      paymentId: razorpay_payment_id,
    })
  } catch (error: unknown) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}
