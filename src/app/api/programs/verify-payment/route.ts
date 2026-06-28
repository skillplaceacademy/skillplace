import { NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPayment } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`verify-payment:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

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

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const payment = await fetchPayment(razorpay_payment_id)
    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

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
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
      profileId = newProfile.id
    }

    const { data: enrollment, error: enrollmentError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id: profileId,
        program_id: programId,
        status: 'active',
        notes: notes || null,
      })
      .select('id')
      .single()

    if (enrollmentError) {
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    const orderId = payment.notes?.order_id || razorpay_order_id
    if (payment.notes?.coupon_id) {
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('used_count')
        .eq('id', payment.notes.coupon_id)
        .single()

      if (coupon) {
        await adminSupabase
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', payment.notes.coupon_id)
      }
    }

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      paymentId: razorpay_payment_id,
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
