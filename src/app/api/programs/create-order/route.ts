import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { adminSupabase } from '@/lib/supabase/admin'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { programId, programName, studentName, email, phone } = await request.json()

    if (!programId || !studentName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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
  } catch (error: unknown) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
