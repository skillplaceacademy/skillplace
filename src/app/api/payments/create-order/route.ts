import { NextRequest, NextResponse } from 'next/server'
import { createOrder, RAZORPAY_KEY_ID } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
    }

    const { data: course, error: courseError } = await adminSupabase
      .from('courses')
      .select('id, title, price, discount_price, slug')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { data: existingEnrollment } = await adminSupabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1)
      .maybeSingle()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    const amount = course.discount_price || course.price

    if (amount === 0) {
      const { data: enrollment, error: enrollError } = await adminSupabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
          progress_percent: 0,
        })
        .select()
        .single()

      if (enrollError) throw enrollError

      return NextResponse.json({
        success: true,
        free: true,
        enrollment,
        redirectUrl: `/courses/${course.slug}/learn`,
      })
    }

    const receipt = `enroll_${userId.slice(0, 8)}_${courseId.slice(0, 8)}_${Date.now()}`
    const order = await createOrder(amount, 'INR', receipt, {
      course_id: courseId,
      user_id: userId,
      course_title: course.title,
    })

    await adminSupabase.from('payments').insert({
      user_id: userId,
      course_id: courseId,
      amount,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
    })

    return NextResponse.json({
      success: false,
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
      course: {
        title: course.title,
        slug: course.slug,
        price: course.price,
        discount_price: course.discount_price,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
