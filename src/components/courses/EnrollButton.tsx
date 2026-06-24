'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { ShoppingCart, CheckCircle, Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react'

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  price: number
  discountPrice: number | null
  title: string
  size?: 'default' | 'sm' | 'lg'
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  discountPrice,
  title,
  size = 'default',
}: EnrollButtonProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

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
        .single()

      setEnrolled(!!enrollment)
    }
    setLoading(false)
  }

  async function enrollFree() {
    if (!user) {
      notify.unauthorized()
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)
    setError('')
    const { error: enrollError } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      status: 'active',
      progress_percent: 0,
    })

    if (enrollError) {
      setError('Failed to enroll. Please try again.')
      notify.enrollError()
      setProcessing(false)
      return
    }

    setEnrolled(true)
    notify.enrollSuccess(title)
    window.location.href = `/courses/${courseSlug}/learn`
  }

  async function initiatePayment() {
    if (!user) {
      notify.unauthorized()
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)
    setError('')

    try {
      notify.paymentRedirecting()
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId: user.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show specific error from API
        if (data.error?.includes('Authentication') || data.error?.includes('BAD_REQUEST')) {
          throw new Error('Payment gateway not configured. Please contact support.')
        }
        throw new Error(data.error || 'Payment initiation failed. Please try again.')
      }

      if (data.free) {
        setEnrolled(true)
        notify.enrollSuccess(title)
        window.location.href = data.redirectUrl
        return
      }

      if (data.success === false && data.orderId) {
        openRazorpayCheckout(data)
      } else {
        throw new Error('Unexpected response from payment server')
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      notify.paymentError(err.message)
    }

    setProcessing(false)
  }

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
        setProcessing(true)
        setError('')
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
            notify.paymentSuccess()
            window.location.href = verifyData.redirectUrl
          } else {
            setError('Payment verification failed. Please contact support.')
            notify.paymentError('Payment verification failed.')
          }
        } catch (err) {
          console.error('Verification error:', err)
          setError('Payment verification failed. Please try again.')
          notify.paymentError('Payment verification failed.')
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

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    }
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again.')
      notify.paymentError('Failed to load payment gateway.')
      setProcessing(false)
    }
    document.body.appendChild(script)
  }

  // Already enrolled
  if (enrolled) {
    return (
      <a href={`/courses/${courseSlug}/learn`}>
        <Button size={size} className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      </a>
    )
  }

  // Loading
  if (loading) {
    return (
      <Button size={size} disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      {/* Price Display */}
      {!isFree && (
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
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Enroll Button */}
      {isFree ? (
        <Button
          size={size}
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
          size={size}
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
