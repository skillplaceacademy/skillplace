# Razorpay Payment Flow for Training Program Enrollment

## Overview
Rewrite the enrollment page at `src/app/programs/[slug]/enroll/page.tsx` to integrate Razorpay payment. The flow:
1. Student fills personal info → clicks "Proceed to Pay"
2. Frontend calls `/api/programs/enroll` to create a Razorpay order
3. Razorpay checkout opens (pay button)
4. On payment success → verify payment → create enrollment → redirect to confirmation
5. On payment failure → show error, allow retry

## Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Junction to: `D:\web software developement\skillplaceacademy\skillplace`

## Prerequisites — Environment Variables
Check if these exist in `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

If they don't exist, ask the user to provide them.

## Current State
- `src/app/programs/[slug]/enroll/page.tsx` — simple form, submits to `/api/programs/enroll`
- `src/app/api/programs/enroll/route.ts` — creates enrollment record (no payment)
- No Razorpay SDK installed
- No payment verification logic

## Tasks

### 1. Install Razorpay SDK
```bash
cd /c/auto_skillplace/skillplace && npm install razorpay
```

### 2. Create Razorpay Order API Route
File: `src/app/api/programs/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function POST(request: NextRequest) {
  try {
    const { programId, programName, studentName, email, phone } = await request.json()

    // Fetch program price from DB
    const { data: program } = await adminSupabase
      .from('training_programs')
      .select('price, discount_price')
      .eq('id', programId)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const amount = (program.discount_price || program.price) * 100 // Razorpay expects paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `enroll_${programId}_${Date.now()}`,
      notes: {
        program_id: programId,
        program_name: programName,
        student_name: studentName,
        email,
        phone,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
```

### 3. Create Payment Verification API Route
File: `src/app/api/programs/verify-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function POST(request: NextRequest) {
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

    // Create enrollment record
    const { data: enrollment, error: enrollError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id: null, // Will be set when user registers/logs in
        program_id: programId,
        status: 'active',
        notes: notes || null,
        program_type: payment.notes?.program_type || null,
      })
      .select()
      .single()

    if (enrollError) {
      return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
    }

    // Create payment record
    await adminSupabase.from('purchases').insert({
      user_id: null,
      course_id: programId,
      amount: payment.amount / 100,
      currency: payment.currency,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: 'completed',
    })

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      paymentId: razorpay_payment_id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
```

### 4. Rewrite Enrollment Page with Razorpay
File: `src/app/programs/[slug]/enroll/page.tsx`

Complete rewrite with this flow:

**Step 1 — Personal Info Form:**
- Full Name, Email, Phone, Location (same as before)
- "Proceed to Pay" button (instead of "Submit Application")

**Step 2 — Payment Step (shown after Step 1):**
- Show order summary (program name, price)
- "Pay Now ₹XXXX" button that triggers Razorpay checkout
- Razorpay script loaded via `https://checkout.razorpay.com/v1/checkout.js`

**Step 3 — Success:**
- Show success message with enrollment details
- Link to dashboard or courses page

**Step 4 — Failure:**
- Show error message
- "Retry Payment" button

**Razorpay Integration Pattern:**
```typescript
function openRazorpay(orderId: string, amount: number, key: string) {
  const options = {
    key,
    amount,
    currency: 'INR',
    name: 'Skillplace Academy',
    description: `Enrollment - ${programName}`,
    order_id: orderId,
    handler: async function (response: any) {
      // Verify payment
      const res = await fetch('/api/programs/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          programId,
          studentName,
          email,
          phone,
          location,
          notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
      } else {
        setStep('failure')
      }
    },
    prefill: {
      name: studentName,
      email,
      contact: phone,
    },
    theme: {
      color: '#2563eb',
    },
    modal: {
      ondismiss: function () {
        setStep('failure')
      },
    },
  }

  const rzp = new (window as any).Razorpay(options)
  rzp.open()
}
```

**Load Razorpay script in useEffect:**
```typescript
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.async = true
  document.body.appendChild(script)
}, [])
```

**Steps UI:**
- Step 0: Personal Info
- Step 1: Payment (order summary + Pay button)
- Step 2: Success / Failure

## Design Requirements
- Light theme (white bg, slate-900 text) — consistent with existing pages
- Use Tailwind CSS only — no inline styles
- Use lucide-react icons (CreditCard, Shield, Check, X, Loader2)
- Step progress indicator (same pattern as current page)
- Order summary card with program name, features, price
- Pay button: blue, full-width, with Razorpay icon
- Success: green checkmark, enrollment confirmed message
- Failure: red X, error message, retry button
- Loading spinner during payment processing

## DO NOT
- Do NOT git push
- Do NOT modify admin files
- Do NOT use inline styles or CSS-in-JS
- Do NOT delete the existing `/api/programs/enroll/route.ts` (keep for backward compat)
- Do NOT hardcode Razorpay credentials — use env vars

## After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify with `git log --oneline -3`
3. Verify the page loads at `/programs/civil-offline/enroll`
4. Test that Razorpay checkout opens when clicking "Pay Now"
