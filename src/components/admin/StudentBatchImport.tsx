'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS, type ProgramType } from '@/lib/constants'
import { getRecords, createRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import { Upload, FileText, Loader2, Check } from 'lucide-react'

interface StudentBatchImportProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

interface ImportResult {
  created: number
  duplicates: number
  errors: string[]
}

interface ParsedStudent {
  full_name: string
  email: string
  phone: string | null
  location: string | null
}

function parseCSV(text: string): ParsedStudent[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  const students: ParsedStudent[] = []
  for (const line of lines) {
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length >= 2 && parts[0] && parts[1]) {
      students.push({
        full_name: parts[0],
        email: parts[1],
        phone: parts[2] || null,
        location: parts[3] || null,
      })
    }
  }
  return students
}

export default function StudentBatchImport({ open, onClose, onComplete }: StudentBatchImportProps) {
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<'import' | 'import_enroll'>('import')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType>('online_course')
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    if (open) {
      async function loadData() {
        const [coursesData, batchesData] = await Promise.all([
          getRecords('courses'),
          getRecords('batches'),
        ])
        setCourses(
          (coursesData || [])
            .filter((c: Record<string, unknown>) => c.is_active !== false)
            .map((c: Record<string, unknown>) => ({
              id: c.id as string,
              title: c.title as string,
            }))
        )
        setBatches(
          (batchesData || [])
            .filter((b: Record<string, unknown>) => b.is_active !== false)
            .map((b: Record<string, unknown>) => ({
              id: b.id as string,
              name: b.name as string,
            }))
        )
      }
      loadData()
    }
  }, [open])

  async function handleImport() {
    const students = parseCSV(inputText)
    if (students.length === 0) {
      notify.genericError('No valid students found. Use format: full_name, email, phone, location')
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const existingData = await getRecords('profiles')
      const existingEmails = new Set(
        (existingData || []).map((p: Record<string, unknown>) => (p.email as string)?.toLowerCase())
      )

      let created = 0
      let duplicates = 0
      const errors: string[] = []

      for (const student of students) {
        if (existingEmails.has(student.email.toLowerCase())) {
          duplicates++
          continue
        }
        try {
          const newProfile = await createRecord('profiles', {
            id: crypto.randomUUID(),
            full_name: student.full_name,
            email: student.email,
            phone: student.phone,
            location: student.location,
            program_type: selectedProgramType,
            batch_id: selectedBatchId || null,
            role: 'student',
            is_active: true,
          })
          created++

          if (mode === 'import_enroll' && selectedCourseId && newProfile?.id) {
            try {
              await createRecord('enrollments', {
                user_id: newProfile.id,
                course_id: selectedCourseId,
                status: 'active',
              })
            } catch {
              errors.push(`Failed to enroll ${student.email}`)
            }
          }
        } catch {
          errors.push(`Failed to create ${student.email}`)
        }
      }

      setResult({ created, duplicates, errors })
      if (created > 0) {
        notify.studentsImported(created)
        onComplete()
      }
    } catch {
      notify.genericError('Failed to process batch import')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setInputText('')
    setMode('import')
    setSelectedCourseId('')
    setSelectedBatchId('')
    setSelectedProgramType('online_course')
    setResult(null)
    onClose()
  }

  const parsedCount = parseCSV(inputText).length

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v) handleClose() }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Import Students</DialogTitle>
          <DialogDescription>
            Import multiple students at once using CSV format
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-6">
            <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-center">
              <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-green-800">Import Complete</p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-green-700">{result.created} student{result.created !== 1 ? 's' : ''} created</p>
                {result.duplicates > 0 && (
                  <p className="text-sm text-amber-600">{result.duplicates} duplicate{result.duplicates !== 1 ? 's' : ''} skipped</p>
                )}
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">{result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:</p>
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i} className="text-xs text-red-500 mt-1">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('import')}
                className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                  mode === 'import' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Upload className="h-5 w-5 mb-1 text-blue-600" />
                <div className="text-sm font-medium">Import Only</div>
                <div className="text-xs text-slate-500">Create student accounts</div>
              </button>
              <button
                onClick={() => setMode('import_enroll')}
                className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                  mode === 'import_enroll' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <FileText className="h-5 w-5 mb-1 text-blue-600" />
                <div className="text-sm font-medium">Import + Enroll</div>
                <div className="text-xs text-slate-500">Create accounts and enroll in a course</div>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-700">Program Type</Label>
                <select
                  value={selectedProgramType}
                  onChange={(e) => setSelectedProgramType(e.target.value as ProgramType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROGRAM_TYPES.map((pt) => (
                    <option key={pt.id} value={pt.id}>{pt.icon} {pt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700">Assign to Batch</Label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              {mode === 'import_enroll' && (
                <div>
                  <Label className="text-slate-700">Enroll in Course</Label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-700">Student Data</Label>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Format: full_name, email, phone, location (one student per line)
              </p>
              <Textarea
                placeholder={"John Doe, john@example.com, +91-9876543210, Mumbai\nJane Smith, jane@example.com, , Delhi\nBob Wilson, bob@example.com, +91-1234567890, Bangalore"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-slate-300 font-mono text-sm"
                rows={8}
              />
              {parsedCount > 0 && (
                <p className="text-xs text-blue-600 mt-1">{parsedCount} student{parsedCount !== 1 ? 's' : ''} detected</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="border-slate-300">Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={loading || parsedCount === 0 || (mode === 'import_enroll' && !selectedCourseId)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading ? 'Importing...' : `Import ${parsedCount} Student${parsedCount !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
