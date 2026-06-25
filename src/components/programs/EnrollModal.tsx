'use client'

import { useState } from 'react'
import { X, Check, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProgramData } from '@/lib/program-data'

interface EnrollModalProps {
  program: ProgramData
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  fullName: string
  email: string
  phone: string
  location: string
  courseId: string
  startDate: string
  notes: string
  acceptTerms: boolean
}

const steps = ['Personal Info', 'Program Details', 'Confirmation']

export default function EnrollModal({ program, isOpen, onClose }: EnrollModalProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    courseId: '',
    startDate: 'immediate',
    notes: '',
    acceptTerms: false,
  })

  if (!isOpen) return null

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
          program_type: program.id,
          course_id: formData.courseId,
          start_date: formData.startDate,
          notes: formData.notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enrollment')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function canProceed() {
    if (step === 0) {
      return formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.phone.trim() !== ''
    }
    if (step === 1) {
      return formData.courseId !== ''
    }
    return true
  }

  function renderStepIndicator() {
    return (
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i < step ? 'bg-blue-600 text-white' :
              i === step ? 'bg-blue-600 text-white' :
              'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  function renderPersonalInfo() {
    return (
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
    )
  }

  function renderProgramDetails() {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Program Details</h3>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">Program: {program.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Select Course *</label>
          <select
            value={formData.courseId}
            onChange={(e) => updateForm({ courseId: e.target.value })}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a course</option>
            {program.courses.map((course, i) => (
              <option key={i} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Preferred Start Date</label>
          <select
            value={formData.startDate}
            onChange={(e) => updateForm({ startDate: e.target.value })}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="immediate">Start Immediately</option>
            <option value="next-batch">Next Batch</option>
          </select>
        </div>
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
      </div>
    )
  }

  function renderConfirmation() {
    return (
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
            <span className="text-sm text-slate-500">Course</span>
            <span className="text-sm font-medium text-slate-900">{formData.courseId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Start Date</span>
            <span className="text-sm font-medium text-slate-900">
              {formData.startDate === 'immediate' ? 'Immediately' : 'Next Batch'}
            </span>
          </div>
          {formData.notes && (
            <div className="border-t border-slate-200 pt-3">
              <span className="text-sm text-slate-500">Notes</span>
              <p className="text-sm text-slate-900 mt-1">{formData.notes}</p>
            </div>
          )}
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
    )
  }

  function renderSuccess() {
    return (
      <div className="text-center py-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
        <p className="text-slate-500 mb-6">
          Thank you for applying to {program.name}. We will review your application and contact you within 24-48 hours.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
          <p className="text-sm font-medium text-blue-800 mb-1">What happens next?</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Our team will review your application</li>
            <li>• You will receive a confirmation email</li>
            <li>• We will schedule a counseling session</li>
            <li>• Complete enrollment and start learning!</li>
          </ul>
        </div>
        <Button onClick={onClose} className="mt-6 bg-blue-600 hover:bg-blue-700">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Join {program.name}</h2>
            <p className="text-sm text-slate-500">Complete the form below to apply</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4">
          {submitted ? (
            renderSuccess()
          ) : (
            <>
              {renderStepIndicator()}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {step === 0 && renderPersonalInfo()}
              {step === 1 && renderProgramDetails()}
              {step === 2 && renderConfirmation()}
            </>
          )}
        </div>

        {!submitted && (
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <Button
              variant="ghost"
              onClick={() => step > 0 ? setStep(step - 1) : onClose()}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              {step > 0 ? 'Back' : 'Cancel'}
            </Button>
            {step < 2 ? (
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
        )}
      </div>
    </div>
  )
}
