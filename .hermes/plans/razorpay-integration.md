# Razorpay Payment Integration & Course Enrollment System

## Goal
Build a complete payment system where:
1. Student clicks "Enroll Now" on a course → sees pricing
2. Student pays via Razorpay (UPI, Card, Netbanking, Wallet)
3. On successful payment → auto-enroll in course
4. Payment verified via webhook → stored in payments table
5. Admin can view all payments and revenue analytics

## Current Issues to Fix

### Issue 1: "Enroll Now" Button Not Showing
**Root Cause**: The EnrollmentButton component checks enrollment but doesn't show properly for unpaid courses.
**Fix**: Add proper payment flow button that shows "Enroll Now ₹XXX" for paid courses and "Enroll Free" for free courses.

### Issue 2: No Payment System
**Root Cause**: No Razorpay integration exists.
**Fix**: Full Razorpay integration with payment verification.

## Razorpay Setup (User Will Provide)

1. Go to **https://dashboard.razorpay.com/**
2. Create account / Login
3. Go to **Settings → API Keys** → Generate Key
4. Note: **Key ID** and **Key Secret**
5. Go to **Settings → Webhooks** → Add webhook URL:
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Secret: Generate and note down

Add to `.env.local`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

## Architecture

```
Student clicks "Enroll Now"
    ↓
Create Razorpay Order (API) → Returns order_id
    ↓
Open Razorpay Checkout (client) → Student pays
    ↓
Razorpay Webhook → Verify signature → Save to payments table
    ↓
Create Enrollment record → Student enrolled
    ↓
Redirect to /courses/[slug]/learn
```

## Tasks

### Step 1: Create `src/lib/razorpay.ts` — Razorpay Server-Side Client

```ts
// src/lib/razorpay.ts
import crypto from 'crypto'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number, // in rupees
  currency: string = 'INR',
  receipt: string,
  notes: Record<string, string> = {}
): Promise<{ id: string; amount: number; currency: string; status: string }> {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    }),
  })

  const data = await res.json()
  if (!data.id) throw new Error(data.error?.description || 'Failed to create order')
  return data
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

// Verify payment status
export async function verifyPayment(paymentId: string): Promise<any> {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
    },
  })

  return res.json()
}

export { RAZORPAY_KEY_ID }
```

### Step 2: Create `src/app/api/payments/create-order/route.ts`

Create Razorpay order when student clicks "Enroll Now":

```ts
// src/app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder, RAZORPAY_KEY_ID } from '@/lib/razorpay'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, discount_price, slug')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Calculate price (use discount_price if available)
    const amount = course.discount_price || course.price

    // Free course — enroll directly
    if (amount === 0) {
      const { data: enrollment, error: enrollError } = await supabase
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

    // Create Razorpay order
    const order = await createRazorpayOrder(
      amount,
      'INR',
      `enroll_${userId}_${courseId}_${Date.now()}`,
      {
        course_id: courseId,
        user_id: userId,
        course_title: course.title,
      }
    )

    // Store pending payment record
    await supabase.from('payments').insert({
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 3: Create `src/app/api/payments/verify/route.ts`

Verify payment after Razorpay callback:

```ts
// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature, verifyPayment } from '@/lib/razorpay'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json()

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Verify payment status with Razorpay
    const payment = await verifyPayment(razorpay_payment_id)

    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    // Get payment record from database
    const { data: paymentRecord, error: recordError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending')
      .single()

    if (recordError || !paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Update payment status
    const { data: updatedPayment } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)
      .select()
      .single()

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: paymentRecord.user_id,
        course_id: paymentRecord.course_id,
        status: 'active',
        progress_percent: 0,
      })
      .select()
      .single()

    if (enrollError) throw enrollError

    // Get course slug for redirect
    const { data: course } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', paymentRecord.course_id)
      .single()

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      enrollment,
      redirectUrl: `/courses/${course?.slug}/learn`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 4: Create `src/app/api/payments/webhook/route.ts`

Razorpay webhook for payment verification (backup):

```ts
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      // Find pending payment
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .eq('status', 'pending')
        .single()

      if (paymentRecord) {
        // Update payment
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: paymentId,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.id)

        // Create enrollment if not exists
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', paymentRecord.user_id)
          .eq('course_id', paymentRecord.course_id)
          .single()

        if (!existingEnrollment) {
          await supabase.from('enrollments').insert({
            user_id: paymentRecord.user_id,
            course_id: paymentRecord.course_id,
            status: 'active',
            progress_percent: 0,
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 5: Create `src/components/course/EnrollButton.tsx` — Complete Enrollment Flow

Replace the old EnrollmentButton with a proper payment-integrated button:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCart, CheckCircle, Loader2, CreditCard, Lock } from 'lucide-react'

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  price: number
  discountPrice: number | null
  title: string
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  discountPrice,
  title,
}: EnrollButtonProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const finalPrice = discountPrice || price
  const isFree = finalPrice === 0

  useEffect(() => {
    checkAuth()
  }, [courseId])

  async function checkAuth() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('course_id', courseId)
        .limit(1)

      setEnrolled(!!enrollment)
    }
    setLoading(false)
  }

  // Free course enrollment
  async function enrollFree() {
    if (!user) {
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)
    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      status: 'active',
      progress_percent: 0,
    })

    if (!error) {
      setEnrolled(true)
      window.location.href = `/courses/${courseSlug}/learn`
    }
    setProcessing(false)
  }

  // Paid course — create Razorpay order
  async function initiatePayment() {
    if (!user) {
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId: user.id }),
      })

      const data = await res.json()

      if (data.free) {
        // Free course enrolled directly
        setEnrolled(true)
        window.location.href = data.redirectUrl
        return
      }

      if (data.success === false && data.orderId) {
        // Open Razorpay checkout
        openRazorpayCheckout(data)
      }
    } catch (err: any) {
      console.error('Payment error:', err)
    }

    setProcessing(false)
  }

  // Open Razorpay checkout popup
  function openRazorpayCheckout(data: any) {
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Skillplace Academy',
      description: title,
      order_id: data.orderId,
      image: '/logo.png',
      handler: async function (response: any) {
        // Payment successful — verify
        setProcessing(true)
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            setEnrolled(true)
            window.location.href = verifyData.redirectUrl
          }
        } catch (err) {
          console.error('Verification error:', err)
        }
        setProcessing(false)
      },
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: function () {
          setProcessing(false)
        },
      },
    }

    // Load Razorpay script dynamically
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    }
    document.body.appendChild(script)
  }

  // Already enrolled — go to course
  if (enrolled) {
    return (
      <a href={`/courses/${courseSlug}/learn`}>
        <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      </a>
    )
  }

  // Loading
  if (loading) {
    return (
      <Button size="lg" disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Not logged in or not enrolled
  return (
    <div className="space-y-3">
      {/* Price Display */}
      <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Course Price</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{finalPrice.toLocaleString()}</span>
            {discountPrice && (
              <span className="text-sm text-slate-400 line-through">₹{price.toLocaleString()}</span>
            )}
          </div>
          {discountPrice && (
            <span className="text-xs text-green-600 font-medium">
              Save ₹{(price - discountPrice).toLocaleString()} ({Math.round((1 - discountPrice / price) * 100)}% OFF)
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Includes</p>
          <p className="text-xs text-slate-700">Lifetime access</p>
          <p className="text-xs text-slate-700">Certificate</p>
        </div>
      </div>

      {/* Enroll Button */}
      {isFree ? (
        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={enrollFree}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          Enroll Free
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={initiatePayment}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Enroll Now — ₹{finalPrice.toLocaleString()}
        </Button>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          Secure Payment
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CreditCard className="h-3 w-3" />
          UPI, Card, Netbanking
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Update `src/app/courses/[slug]/page.tsx` — Course Detail Page

Replace the old EnrollmentButton with the new payment-integrated EnrollButton:

```tsx
// In the course detail page, replace:
// <EnrollmentButton courseId={course.id} courseSlug={course.slug} price={course.price} />

// With:
<EnrollButton
  courseId={course.id}
  courseSlug={course.slug}
  price={course.price}
  discountPrice={course.discount_price}
  title={course.title}
/>
```

### Step 7: Update `src/app/courses/[slug]/learn/CourseLearnClient.tsx`

Remove the old EnrollmentButton import and usage. The "Continue Learning" button should be a simple link:

```tsx
// Replace EnrollmentButton usage with:
<Link href={`/courses/${courseSlug}/learn`}>
  <Button size="lg" className="bg-green-600 hover:bg-green-700">
    <Play className="h-4 w-4 mr-2" />
    Continue Learning
  </Button>
</Link>
```

### Step 8: Update `src/app/admin-place/payments/page.tsx` — Admin Payments Dashboard

Show payment analytics and list:

```tsx
// Fetch payments with joins
const paymentsData = await getRecords('payments', undefined, undefined, '*,profiles(full_name,email),courses(title)')

// Show stats
// - Total revenue
// - Completed payments
// - Pending payments
// - Revenue this month
// - Top selling courses
```

### Step 9: Update `src/app/admin-place/page.tsx` — Dashboard Stats

Add payment stats to admin dashboard:

```tsx
// Fetch payment stats
const { data: payments } = await adminSupabase
  .from('payments')
  .select('amount, status')
  .eq('status', 'completed')

const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
```

### Step 10: Update Database — Ensure payments table has razorpay columns

```sql
-- Add Razorpay-specific columns if not exist
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
```

## DO NOT
- Do NOT run git push
- Do NOT expose Razorpay Key Secret in client code
- Do NOT skip payment verification (always verify signature)
- Do NOT enroll student without verified payment

## After Completion
- Run `npx tsc --noEmit` — zero errors
- Student clicks "Enroll Now ₹XXX" → Razorpay checkout opens
- On payment success → auto-enroll → redirect to learning page
- Admin can view payments at `/admin-place/payments`
- Webhook verifies payment as backup
- Free courses enroll directly without payment
