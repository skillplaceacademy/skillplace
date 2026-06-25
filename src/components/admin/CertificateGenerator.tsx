'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_THEMES,
  type CertificateType,
  type CertificateTheme,
  type CertificateRecord,
} from '@/lib/certificate-types'
import { generateCertificateHTML } from '@/lib/certificate-templates'
import { getRecords, createRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Save,
  RotateCw,
} from 'lucide-react'

interface Student {
  id: string
  full_name: string | null
  email: string
}

interface Course {
  id: string
  title: string
  duration_hours: number | null
}

interface CertificateGeneratorProps {
  certificates: CertificateRecord[]
  onComplete: () => void
}

function generateCertificateNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  const yearPrefix = `SP-${year}-`
  const yearNumbers = existingNumbers
    .filter((n) => n.startsWith(yearPrefix))
    .map((n) => parseInt(n.replace(yearPrefix, ''), 10))
    .filter((n) => !isNaN(n))
  const sequential = yearNumbers.length > 0 ? Math.max(...yearNumbers) + 1 : 1
  const certNumber = `${yearPrefix}${sequential.toString().padStart(5, '0')}`
  if (existingNumbers.includes(certNumber)) {
    return `${yearPrefix}${(sequential + 1).toString().padStart(5, '0')}`
  }
  return certNumber
}

function buildCertificateHTML(
  studentName: string,
  courseName: string,
  certNumber: string,
  issuedDate: string,
  duration: string,
  typeId: CertificateType,
  themeId: CertificateTheme,
  organizationName: string,
  customMessage: string
): string {
  return generateCertificateHTML({
    studentName,
    courseName,
    certNumber,
    issuedDate,
    duration,
    typeId,
    themeId,
    organizationName,
    customMessage,
  })
}

export default function CertificateGenerator({
  certificates,
  onComplete,
}: CertificateGeneratorProps) {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('')
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme | ''>('')
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    certificate_number: '',
    organization_name: '',
    custom_message: '',
    issued_at: new Date().toISOString().split('T')[0],
  })
  const previewRef = useRef<HTMLDivElement>(null)

  const existingNumbers = useMemo(
    () => certificates.map((c) => (c.certificate_number as string) || ''),
    [certificates]
  )

  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      const [studentsData, coursesData] = await Promise.all([
        getRecords('profiles'),
        getRecords('courses'),
      ])
      setStudents(
        (studentsData || [])
          .filter((s: Record<string, unknown>) => s.role === 'student')
          .map((s: Record<string, unknown>) => ({
            id: s.id as string,
            full_name: s.full_name as string | null,
            email: s.email as string,
          }))
      )
      setCourses(
        (coursesData || [])
          .filter((c: Record<string, unknown>) => c.is_active !== false)
          .map((c: Record<string, unknown>) => ({
            id: c.id as string,
            title: c.title as string,
            duration_hours: c.duration_hours as number | null,
          }))
      )
      setLoadingData(false)
    }
    loadData()
  }, [])

  function handleRegenerateNumber() {
    const newNumber = generateCertificateNumber(existingNumbers)
    setFormData((prev) => ({ ...prev, certificate_number: newNumber }))
  }

  function handleOpenForm() {
    const newNumber = generateCertificateNumber(existingNumbers)
    setFormData({
      student_id: '',
      course_id: '',
      certificate_number: newNumber,
      organization_name: '',
      custom_message: '',
      issued_at: new Date().toISOString().split('T')[0],
    })
    setSelectedType('')
    setSelectedTheme('')
    setStep(1)
  }

  const currentType = CERTIFICATE_TYPES.find((t) => t.id === selectedType)
  const currentTheme = CERTIFICATE_THEMES.find((t) => t.id === selectedTheme)

  const showCourseField = selectedType === 'course_completion'
  const showOrganizationField = ['internship', 'training', 'experience'].includes(selectedType)
  const showCustomMessageField = ['achievement', 'excellence', 'other'].includes(selectedType)

  const selectedStudent = students.find((s) => s.id === formData.student_id)
  const selectedCourse = courses.find((c) => c.id === formData.course_id)
  const studentName = selectedStudent?.full_name || selectedStudent?.email || 'Student'
  const courseName = selectedCourse?.title || 'Course'
  const duration = selectedCourse?.duration_hours?.toString() || 'N/A'

  const previewHTML = useMemo(() => {
    if (!selectedType || !selectedTheme) return ''
    const issuedDate = new Date(formData.issued_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return buildCertificateHTML(
      studentName,
      courseName,
      formData.certificate_number || 'SP-00000-00000',
      issuedDate,
      duration,
      selectedType as CertificateType,
      selectedTheme as CertificateTheme,
      formData.organization_name,
      formData.custom_message
    )
  }, [
    selectedType,
    selectedTheme,
    studentName,
    courseName,
    formData.certificate_number,
    formData.issued_at,
    duration,
    formData.organization_name,
    formData.custom_message,
  ])

  async function handleSave() {
    if (!selectedType || !selectedTheme) return
    setSubmitting(true)
    try {
      await createRecord('certificates', {
        user_id: formData.student_id,
        course_id: showCourseField ? formData.course_id : null,
        certificate_number: formData.certificate_number,
        issued_at: new Date(formData.issued_at).toISOString(),
        certificate_type: selectedType,
        theme: selectedTheme,
        organization_name: formData.organization_name || null,
        custom_message: formData.custom_message || null,
      })
      notify.certificateDownloaded()
      onComplete()
    } catch {
      notify.certificateError()
    } finally {
      setSubmitting(false)
    }
  }

  function handleDownloadPDF() {
    const iframe = previewRef.current?.querySelector('iframe')
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ action: 'downloadPDF' }, '*')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">
          {step === 1 && 'Step 1: Select Certificate Type'}
          {step === 2 && 'Step 2: Choose Theme'}
          {step === 3 && 'Step 3: Fill Details'}
          {step === 4 && 'Step 4: Preview & Generate'}
        </h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          {loadingData ? (
            <p className="text-slate-500 text-center py-8">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CERTIFICATE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as CertificateType)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedType === type.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-slate-900 text-sm">{type.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-6">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CERTIFICATE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id as CertificateTheme)}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedTheme === theme.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200"
                    style={{ backgroundColor: theme.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-200"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <div className="font-semibold text-slate-900 text-sm">{theme.label}</div>
                <div className="text-xs text-slate-500 mt-1">{theme.description}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedTheme}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {loadingData ? (
            <p className="text-slate-500 text-center py-8">Loading data...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student" className="text-slate-700">
                  Student
                </Label>
                <select
                  id="student"
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email}
                    </option>
                  ))}
                </select>
              </div>

              {showCourseField && (
                <div>
                  <Label htmlFor="course" className="text-slate-700">
                    Course
                  </Label>
                  <select
                    id="course"
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({ ...formData, course_id: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label htmlFor="certNumber" className="text-slate-700">
                  Certificate Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="certNumber"
                    placeholder="SP-2024-XXXXX"
                    value={formData.certificate_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certificate_number: e.target.value.toUpperCase(),
                      })
                    }
                    className="border-slate-300 font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateNumber}
                    className="shrink-0 border-slate-300"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="issuedAt" className="text-slate-700">
                  Date Issued
                </Label>
                <Input
                  id="issuedAt"
                  type="date"
                  value={formData.issued_at}
                  onChange={(e) =>
                    setFormData({ ...formData, issued_at: e.target.value })
                  }
                  className="border-slate-300"
                />
              </div>

              {showOrganizationField && (
                <div className="sm:col-span-2">
                  <Label htmlFor="organization" className="text-slate-700">
                    Organization Name
                  </Label>
                  <Input
                    id="organization"
                    placeholder="Enter organization name"
                    value={formData.organization_name}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_name: e.target.value })
                    }
                    className="border-slate-300"
                  />
                </div>
              )}

              {showCustomMessageField && (
                <div className="sm:col-span-2">
                  <Label htmlFor="customMessage" className="text-slate-700">
                    Custom Message
                  </Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Enter custom message for the certificate"
                    value={formData.custom_message}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_message: e.target.value })
                    }
                    className="border-slate-300"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!formData.student_id || !formData.certificate_number}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Preview <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {currentType && (
              <Badge variant="secondary" className="gap-1">
                {currentType.icon} {currentType.label}
              </Badge>
            )}
            {currentTheme && (
              <Badge variant="outline" className="gap-1">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: currentTheme.primary }}
                />
                {currentTheme.label}
              </Badge>
            )}
            <Badge variant="outline">{formData.certificate_number}</Badge>
          </div>

          <div
            ref={previewRef}
            className="border border-slate-200 rounded-xl overflow-hidden mb-4"
            style={{ aspectRatio: '1056 / 748' }}
          >
            {previewHTML ? (
              <iframe
                srcDoc={previewHTML}
                className="w-full h-full border-0"
                title="Certificate Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No preview available
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={submitting || !formData.student_id}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Saving...' : 'Save to Database'}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
