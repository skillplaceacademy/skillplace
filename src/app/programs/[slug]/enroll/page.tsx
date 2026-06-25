'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { getRecords } from '@/lib/admin-api'

interface ProgramInfo {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  program_type: string
  branches: { name: string; slug: string } | null
}

interface Course {
  id: string
  title: string
}

interface FormData {
  fullName: string
  email: string
  phone: string
  location: string
  notes: string
  acceptTerms: boolean
}

export default function EnrollPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramInfo | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    notes: '',
    acceptTerms: false,
  })

  useEffect(() => {
    fetchProgram()
  }, [slug])

  async function fetchProgram() {
    setLoading(true)
    try {
      const programs = await getRecords('training_programs', 'slug', slug, 'branches(*)')
      if (!programs || programs.length === 0) { setLoading(false); return }
      const prog = programs[0]
      setProgram(prog)

      try {
        const programCourses = await getRecords('program_courses', 'program_id', prog.id, 'courses(id,title)')
        setCourses((programCourses || []).map((pc: any) => pc.courses).filter(Boolean))
      } catch (e) {
        console.error('Failed to fetch courses:', e)
        setCourses([])
      }
    } catch (err) {
      console.error('Failed to fetch program:', err)
      setProgram(null)
    }
    setLoading(false)
  }

  function updateForm(updates: Partial<FormData>) {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  async function handleSubmit() {
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          program_type: slug,
          notes: formData.notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enrollment')
      }

      toast.success('Enrollment application submitted successfully!')
      router.push('/courses')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function canProceed() {
    if (step === 0) {
      return formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== ''
    }
    return true
  }

  const steps = ['Personal Info', 'Review & Submit']

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Program Not Found</h1>
          <Link href="/programs">
            <Button className="bg-blue-600 hover:bg-blue-700">Browse Programs</Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayPrice = program.discount_price || program.price

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-0">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/programs/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {program.name}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="h-6 w-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">
                    {program.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
                  <p className="text-sm text-slate-500">Duration: {program.duration_weeks} weeks</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">{program.description}</p>
              <div className="space-y-2 mb-4">
                {program.features.slice(0, 5).map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-800 font-medium mb-1">Program Fee</p>
                <p className="text-2xl font-bold text-slate-900">₹{displayPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Enroll in {program.name}</h1>
              <p className="text-slate-500 mb-6">Complete the form below to apply</p>

              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      i <= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${
                      i <= step ? 'text-slate-900' : 'text-slate-400'
                    }`}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateForm({ fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="Enter your email"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Phone *</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm({ phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => updateForm({ location: e.target.value })}
                      placeholder="City, State"
                      className="border-slate-300"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Review & Confirm</h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Name</span>
                      <span className="text-sm font-medium text-slate-900">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Phone</span>
                      <span className="text-sm font-medium text-slate-900">{formData.phone}</span>
                    </div>
                    {formData.location && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Location</span>
                        <span className="text-sm font-medium text-slate-900">{formData.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-500">Program</span>
                      <span className="text-sm font-medium text-blue-600">{program.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Fee</span>
                      <span className="text-sm font-medium text-slate-900">₹{displayPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  {courses.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Courses Included:</p>
                      <ul className="space-y-1">
                        {courses.map((c) => (
                          <li key={c.id} className="text-sm text-slate-600 flex items-center gap-2">
                            <Check className="h-3 w-3 text-blue-600 shrink-0" />
                            {c.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Goals / Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateForm({ notes: e.target.value })}
                      placeholder="Any specific goals or questions..."
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateForm({ acceptTerms: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the terms and conditions and understand that this is an application, not a guaranteed enrollment.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <Button
                  variant="ghost"
                  onClick={() => step > 0 ? setStep(step - 1) : router.back()}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {step > 0 ? 'Back' : 'Cancel'}
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="bg-blue-600 hover:bg-blue-700 gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !formData.acceptTerms}
                    className="bg-blue-600 hover:bg-blue-700 gap-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
